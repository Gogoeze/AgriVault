import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { keys } from "@/lib/query-client"
import { supabase } from "@/lib/supabase"
import type { BatchDetailRow, UserDirectoryRow } from "@/types/database"

export const PAGE_SIZE = 10

export interface Page<Row> {
  rows: Row[]
  total: number
}

/** Batches across the facility, for the admin inventory table. */
export function useBatches(search: string, page: number) {
  return useQuery({
    queryKey: keys.batches(search, page),
    queryFn: async (): Promise<Page<BatchDetailRow>> => {
      let query = supabase
        .from("v_batch_detail")
        .select("*", { count: "exact" })
        .order("stored_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      const term = search.trim()
      if (term) {
        query = query.or(`reference.ilike.%${term}%,farmer_name.ilike.%${term}%`)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { rows: data ?? [], total: count ?? 0 }
    },
  })
}

/** The signed-in farmer's own batches. RLS does the filtering. */
export function useMyBatches() {
  return useQuery({
    queryKey: keys.myBatches,
    queryFn: async (): Promise<BatchDetailRow[]> => {
      const { data, error } = await supabase
        .from("v_batch_detail")
        .select("*")
        .in("status", ["stored", "partially_withdrawn", "expired"])
        .order("expires_at")
      if (error) throw error
      return data ?? []
    },
  })
}

/** The farmer directory, with stored weight and outstanding balance. */
export function useUserDirectory(search: string, page: number) {
  return useQuery({
    queryKey: keys.users(search, page),
    queryFn: async (): Promise<Page<UserDirectoryRow>> => {
      let query = supabase
        .from("v_user_directory")
        .select("*", { count: "exact" })
        .order("full_name")
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      const term = search.trim()
      if (term) {
        query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { rows: data ?? [], total: count ?? 0 }
    },
  })
}

export interface NewBatch {
  farmerId: string
  unitId: string
  produceId: string | null
  intakeKg: number
  months: number
}

export function useCreateBatch() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (input: NewBatch) => {
      const storedAt = new Date()
      const expiresAt = new Date(storedAt)
      expiresAt.setMonth(expiresAt.getMonth() + input.months)

      const { data, error } = await supabase
        .from("storage_batches")
        .insert({
          farmer_id: input.farmerId,
          unit_id: input.unitId,
          produce_id: input.produceId,
          intake_kg: input.intakeKg,
          available_kg: input.intakeKg,
          stored_at: storedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select("*")
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["batches"] })
      void client.invalidateQueries({ queryKey: keys.dashboard })
    },
  })
}
