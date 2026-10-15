import { onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"

import { rtdb } from "@/lib/firebase"
import type { Device, DeviceThresholds } from "@/types/models"

/**
 * Live sensor values, read straight from the Realtime Database.
 *
 * WHY THIS EXISTS. The rig writes to the RTDB continuously, but Firestore only
 * learns about it when the sync route runs. That route needs a scheduler, and
 * a scheduler does not exist on a developer's laptop and runs once a day on
 * Vercel's free plan — so the dashboard sat empty while the data was right
 * there in Firebase.
 *
 * So the live tiles subscribe to the RTDB directly. Values appear the instant
 * the rig posts them, with no cron, no deploy and no server involved. The sync
 * route still runs, but its job is now history and alerting rather than
 * "is there anything to show at all".
 *
 * ADMIN ONLY. The database rules allow a read only from a token carrying
 * role=admin, so a farmer calling this gets a permission error rather than a
 * temperature. That claim is set by scripts/seed.ts and scripts/set-admin.ts;
 * an admin signed in on an older token will see `denied` until they sign in
 * again, which `error` below reports in plain words.
 */

export interface LiveReading {
  deviceId: string
  unitCode: string
  temperatureC: number
  humidityPct: number
  isActive: boolean
  recordedAt: string
  /** False once the reading is older than the staleness window. */
  fresh: boolean
  thresholds: DeviceThresholds | null
}

/** The shape the rig writes. Treated as untrusted — anything may be missing. */
interface DeviceNode {
  data?: {
    onionStorageId?: string
    temp?: number | string
    humidity?: number | string
    isActive?: boolean
    timestamp?: string
  }
  settings?: Record<string, number | string | undefined>
}

const num = (value: unknown): number | null => {
  const parsed = typeof value === "string" ? Number(value) : value
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null
}

/** Humidity thresholds are whole percentage points, as the rig runs them. */
const whole = (value: unknown): number | null => {
  const parsed = num(value)
  return parsed === null ? null : Math.round(parsed)
}

const STALE_AFTER_MS = 2 * 60 * 60 * 1000

export interface LiveReadingsState {
  readings: LiveReading[]
  loading: boolean
  /** A sentence worth showing, or null. */
  error: string | null
}

export function useLiveReadings(devices: Device[], enabled = true): LiveReadingsState {
  const [readings, setReadings] = useState<Record<string, LiveReading>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  /** Null until the first snapshot or error arrives for any device. */
  const [settled, setSettled] = useState(false)

  // Subscribe per device. Joining on deviceId keeps the effect from tearing
  // down and rebuilding every subscription whenever the devices array is
  // rebuilt with the same contents.
  const deviceKey = devices.map((device) => `${device.deviceId}:${device.unitCode}`).join(",")

  useEffect(() => {
    if (!enabled || devices.length === 0) return

    const unsubscribes = devices.map((device) =>
      onValue(
        ref(rtdb, device.deviceId),
        (snapshot) => {
          setSettled(true)
          setErrors((current) => {
            if (!current[device.deviceId]) return current
            const next = { ...current }
            delete next[device.deviceId]
            return next
          })

          const node = (snapshot.val() ?? {}) as DeviceNode
          const temperature = num(node.data?.temp)
          const humidity = num(node.data?.humidity)

          if (temperature === null || humidity === null) {
            setReadings((current) => {
              const next = { ...current }
              delete next[device.deviceId]
              return next
            })
            return
          }

          const stamped = node.data?.timestamp ? new Date(node.data.timestamp) : new Date()
          const recordedAt = Number.isNaN(stamped.getTime()) ? new Date() : stamped

          setReadings((current) => ({
            ...current,
            [device.deviceId]: {
              deviceId: device.deviceId,
              unitCode: device.unitCode,
              temperatureC: temperature,
              humidityPct: humidity,
              isActive: node.data?.isActive !== false,
              recordedAt: recordedAt.toISOString(),
              fresh: Date.now() - recordedAt.getTime() < STALE_AFTER_MS,
              thresholds: node.settings
                ? {
                    highTempThreshold: num(node.settings.highTempThreshold),
                    lowTempThreshold: num(node.settings.lowTempThreshold),
                    highHumThreshold: whole(node.settings.highHumThreshold),
                    lowHumThreshold: whole(node.settings.lowHumThreshold),
                  }
                : null,
            },
          }))
        },
        (cause) => {
          setSettled(true)
          // The common cause by far is a token issued before the admin claim
          // was set, so say that rather than echoing Firebase's wording.
          const message =
            cause.message.includes("permission") || cause.message.includes("Permission")
              ? "Sign out and back in — your session predates the admin role, so the sensor database is refusing it."
              : cause.message
          setErrors((current) => ({ ...current, [device.deviceId]: message }))
        },
      ),
    )

    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe()
    }
    // deviceKey stands in for devices: same contents, same subscriptions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceKey, enabled])

  // Nothing to wait for when there is nothing to subscribe to.
  const loading = enabled && devices.length > 0 && !settled

  return {
    readings: Object.values(readings).sort((a, b) => a.unitCode.localeCompare(b.unitCode)),
    loading,
    error: Object.values(errors)[0] ?? null,
  }
}

/** The newest reading across every room, for the headline tiles. */
export function newestReading(readings: LiveReading[]): LiveReading | null {
  return readings.reduce<LiveReading | null>(
    (newest, reading) => (!newest || reading.recordedAt > newest.recordedAt ? reading : newest),
    null,
  )
}
