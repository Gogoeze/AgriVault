import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { keys } from "@/lib/query-client"
import { supabase } from "@/lib/supabase"
import type { Alert, SensorReading, StorageConditions } from "@/types/database"

export const READINGS_PAGE_SIZE = 8

export function useLatestReading() {
  return useQuery({
    queryKey: keys.latestReading,
    staleTime: 15_000,
    queryFn: async (): Promise<SensorReading | null> => {
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useReadings(page: number) {
  return useQuery({
    queryKey: keys.readings(page),
    queryFn: async (): Promise<{ rows: SensorReading[]; total: number }> => {
      const { data, error, count } = await supabase
        .from("sensor_readings")
        .select("*", { count: "exact" })
        .order("recorded_at", { ascending: false })
        .range((page - 1) * READINGS_PAGE_SIZE, page * READINGS_PAGE_SIZE - 1)
      if (error) throw error
      return { rows: data ?? [], total: count ?? 0 }
    },
  })
}

/** Readings over a window, oldest first, for the charts. */
export function useReadingSeries(hours: number) {
  return useQuery({
    queryKey: keys.readingsSeries(hours),
    queryFn: async (): Promise<SensorReading[]> => {
      const since = new Date(Date.now() - hours * 3_600_000).toISOString()
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .gte("recorded_at", since)
        .order("recorded_at")
      if (error) throw error
      return data ?? []
    },
  })
}

export function useOpenAlerts(limit = 10) {
  return useQuery({
    queryKey: keys.alerts("open"),
    queryFn: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("status", "open")
        .order("raised_at", { ascending: false })
        .limit(limit)
      if (error) throw error
      return data ?? []
    },
  })
}

/**
 * Keep the readings and alerts in this tab in step with the database. The
 * sensor rig posts to the ingest function, Postgres raises any alert, and the
 * change arrives here over the realtime channel.
 */
export function useLiveClimate() {
  const client = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel("climate")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings" },
        () => {
          void client.invalidateQueries({ queryKey: ["readings"] })
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        void client.invalidateQueries({ queryKey: ["alerts"] })
        void client.invalidateQueries({ queryKey: keys.dashboard })
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [client])
}

/**
 * The only thing a farmer is allowed to learn about conditions: a verdict, and
 * when it was taken. The function behind it is security definer and refuses to
 * answer for anyone without produce on site — no reading ever crosses the wire.
 */
export function useStorageConditions(enabled = true) {
  return useQuery({
    queryKey: keys.conditions,
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<StorageConditions> => {
      const { data, error } = await supabase.rpc("storage_conditions")
      if (error) throw error
      return data?.[0] ?? { verdict: "unknown", checked_at: null }
    },
  })
}
