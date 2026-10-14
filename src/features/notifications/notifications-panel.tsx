import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { Icon } from "@/components/ui/icon"
import { EmptyState } from "@/components/ui/table"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/cn"
import { relativeDateTime } from "@/lib/format"
import { keys } from "@/lib/query-client"
import { supabase } from "@/lib/supabase"
import type { Notification, NotificationCategory } from "@/types/database"

const ICONS: Record<NotificationCategory, string> = {
  alert: "warning",
  withdrawal: "outbox",
  payment: "payments",
  storage: "inventory_2",
  account: "person",
}

export function NotificationsPanel({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const client = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: keys.notifications,
    enabled: Boolean(session),
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30)
      if (error) throw error
      return data ?? []
    },
  })

  // The database pushes new rows here, so the bell updates without polling.
  useEffect(() => {
    if (!session) return
    const channel = supabase
      .channel("notifications-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => void client.invalidateQueries({ queryKey: keys.notifications }),
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [session, client])

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.notifications }),
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null)
      if (error) throw error
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.notifications }),
  })

  const unread = notifications.filter((item) => !item.read_at).length

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative flex size-9 items-center justify-center rounded-md border border-line-strong text-ink-muted transition-colors hover:bg-neutral-50"
      >
        <Icon name="notifications" className="text-base" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-critical text-[10px] font-semibold text-neutral-0">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-lg border border-line bg-surface shadow-raised">
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-sm font-semibold">Notifications</h2>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </header>

            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <EmptyState
                  title="Nothing to read"
                  description="Alerts and updates will appear here."
                  icon="notifications_off"
                />
              ) : (
                <ul>
                  {notifications.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!item.read_at) markRead.mutate(item.id)
                          if (item.link) {
                            onOpenChange(false)
                            void navigate(item.link)
                          }
                        }}
                        className={cn(
                          "flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-neutral-50",
                          !item.read_at && "bg-brand-50/60",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
                            item.category === "alert"
                              ? "bg-critical-soft text-critical"
                              : "bg-brand-50 text-brand-600",
                          )}
                        >
                          <Icon name={ICONS[item.category]} className="text-base" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium text-ink">{item.title}</span>
                          {item.body && (
                            <span className="block pt-1 text-xs text-ink-muted">{item.body}</span>
                          )}
                          <span className="mono block pt-1 text-2xs text-ink-subtle">
                            {relativeDateTime(item.created_at)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
