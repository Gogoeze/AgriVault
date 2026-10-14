import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { keys } from "@/lib/query-client"
import { supabase } from "@/lib/supabase"
import type { WithdrawalRequest, WithdrawalStatus } from "@/types/database"

export interface WithdrawalWithContext extends WithdrawalRequest {
  farmer: { full_name: string } | null
  batch: { reference: string; available_kg: number } | null
}

const SELECT =
  "*, farmer:profiles!withdrawal_requests_farmer_id_fkey(full_name), batch:storage_batches(reference, available_kg)"

/** Requests across the facility. Admins see all; the view is filtered by RLS. */
export function useWithdrawals(status: WithdrawalStatus | "all" = "pending", limit = 20) {
  return useQuery({
    queryKey: keys.withdrawals(status),
    queryFn: async (): Promise<WithdrawalWithContext[]> => {
      let query = supabase
        .from("withdrawal_requests")
        .select(SELECT)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (status !== "all") query = query.eq("status", status)

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as WithdrawalWithContext[]
    },
  })
}

export function useMyWithdrawals() {
  return useQuery({
    queryKey: keys.myWithdrawals,
    queryFn: async (): Promise<WithdrawalWithContext[]> => {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select(SELECT)
        .order("created_at", { ascending: false })
        .limit(20)
      if (error) throw error
      return (data ?? []) as unknown as WithdrawalWithContext[]
    },
  })
}

export function useRequestWithdrawal() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (input: { batchId: string; farmerId: string; quantityKg: number }) => {
      const { error } = await supabase.from("withdrawal_requests").insert({
        batch_id: input.batchId,
        farmer_id: input.farmerId,
        quantity_kg: input.quantityKg,
      })
      // The database checks the request against what is actually in the batch,
      // including anything already in flight, and rejects it if it does not fit.
      if (error) throw error
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["withdrawals"] })
      void client.invalidateQueries({ queryKey: keys.myBatches })
    },
  })
}

export function useDecideWithdrawal() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string; status: WithdrawalStatus; note?: string }) => {
      const { error } = await supabase
        .from("withdrawal_requests")
        .update({
          status: input.status,
          note: input.note ?? null,
          decided_at: new Date().toISOString(),
        })
        .eq("id", input.id)
      if (error) throw error
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["withdrawals"] })
      void client.invalidateQueries({ queryKey: ["batches"] })
      void client.invalidateQueries({ queryKey: keys.dashboard })
    },
  })
}
