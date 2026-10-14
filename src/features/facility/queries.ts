import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { keys } from "@/lib/query-client"
import { supabase } from "@/lib/supabase"
import type {
  Facility,
  FacilityOverviewRow,
  FacilitySettings,
  ProduceType,
  StorageUnit,
} from "@/types/database"

/** The single facility this deployment manages. */
export function useFacility() {
  return useQuery({
    queryKey: keys.facility,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Facility | null> => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("created_at")
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useFacilitySettings() {
  return useQuery({
    queryKey: keys.settings,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<FacilitySettings | null> => {
      const { data, error } = await supabase
        .from("facility_settings")
        .select("*")
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useStorageUnits() {
  return useQuery({
    queryKey: keys.units,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<StorageUnit[]> => {
      const { data, error } = await supabase.from("storage_units").select("*").order("code")
      if (error) throw error
      return data ?? []
    },
  })
}

export function useProduceTypes() {
  return useQuery({
    queryKey: keys.produce,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ProduceType[]> => {
      const { data, error } = await supabase
        .from("produce_types")
        .select("*")
        .eq("is_active", true)
        .order("name")
      if (error) throw error
      return data ?? []
    },
  })
}

/** Headline numbers for the admin dashboard, computed in the database. */
export function useFacilityOverview() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: async (): Promise<FacilityOverviewRow | null> => {
      const { data, error } = await supabase
        .from("v_facility_overview")
        .select("*")
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useSaveSettings() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (patch: Partial<FacilitySettings> & { facility_id: string }) => {
      const { error } = await supabase
        .from("facility_settings")
        .update(patch)
        .eq("facility_id", patch.facility_id)
      if (error) throw error
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: keys.settings })
      void client.invalidateQueries({ queryKey: keys.dashboard })
    },
  })
}

export function useSaveFacility() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (patch: Partial<Facility> & { id: string }) => {
      const { error } = await supabase.from("facilities").update(patch).eq("id", patch.id)
      if (error) throw error
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: keys.facility })
      void client.invalidateQueries({ queryKey: keys.dashboard })
    },
  })
}

export function useAddProduce() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async ({ facilityId, name }: { facilityId: string; name: string }) => {
      const { error } = await supabase
        .from("produce_types")
        .insert({ facility_id: facilityId, name })
      if (error) throw error
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.produce }),
  })
}
