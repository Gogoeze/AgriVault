import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { keys } from "@/lib/query-client"
import { supabase } from "@/lib/supabase"
import type { PaymentDetailRow, PaymentMethod, PaymentStatus } from "@/types/database"

export const PAGE_SIZE = 10

export type DateRange = "all" | "month" | "30"

function since(range: DateRange): string | null {
  if (range === "all") return null
  if (range === "30") return new Date(Date.now() - 30 * 86_400_000).toISOString()
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export function usePayments(options: {
  search: string
  status: PaymentStatus | "all"
  range: DateRange
  page: number
}) {
  const { search, status, range, page } = options

  return useQuery({
    queryKey: keys.payments(search, status, range, page),
    queryFn: async (): Promise<{ rows: PaymentDetailRow[]; total: number }> => {
      let query = supabase
        .from("v_payment_detail")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      const term = search.trim()
      if (term) {
        query = query.or(
          `receipt_no.ilike.%${term}%,farmer_name.ilike.%${term}%,batch_reference.ilike.%${term}%`,
        )
      }
      if (status !== "all") query = query.eq("status", status)

      const from = since(range)
      if (from) query = query.gte("created_at", from)

      const { data, error, count } = await query
      if (error) throw error
      return { rows: data ?? [], total: count ?? 0 }
    },
  })
}

export function useMyPayments(page: number) {
  return useQuery({
    queryKey: keys.myPayments(page),
    queryFn: async (): Promise<{ rows: PaymentDetailRow[]; total: number }> => {
      const { data, error, count } = await supabase
        .from("v_payment_detail")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      if (error) throw error
      return { rows: data ?? [], total: count ?? 0 }
    },
  })
}

export interface PaymentTotals {
  collectedKobo: number
  outstandingKobo: number
  monthKobo: number
}

/**
 * Totals across every payment, not just the page on screen. Sums come back
 * from a single select rather than from the rows the table happens to hold.
 */
export function usePaymentTotals() {
  return useQuery({
    queryKey: keys.paymentStats,
    queryFn: async (): Promise<PaymentTotals> => {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const [all, month] = await Promise.all([
        supabase.from("payments").select("paid_kobo, balance_kobo"),
        supabase.from("payments").select("paid_kobo").gte("paid_at", monthStart.toISOString()),
      ])

      if (all.error) throw all.error
      if (month.error) throw month.error

      return {
        collectedKobo: (all.data ?? []).reduce((sum, row) => sum + row.paid_kobo, 0),
        outstandingKobo: (all.data ?? []).reduce((sum, row) => sum + row.balance_kobo, 0),
        monthKobo: (month.data ?? []).reduce((sum, row) => sum + row.paid_kobo, 0),
      }
    },
  })
}

export function useRecordPayment() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      id: string
      paidKobo: number
      method: PaymentMethod
      transactionRef?: string
      recordedBy: string
    }) => {
      const { error } = await supabase
        .from("payments")
        .update({
          paid_kobo: input.paidKobo,
          method: input.method,
          transaction_ref: input.transactionRef ?? null,
          recorded_by: input.recordedBy,
        })
        .eq("id", input.id)
      if (error) throw error
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["payments"] })
      void client.invalidateQueries({ queryKey: keys.dashboard })
    },
  })
}
