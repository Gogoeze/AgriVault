import { useState } from "react";
import notificationIcon from "@/shared/assets/icons/notification.svg";
import avatar from "@/shared/assets/avatar.jpg";
import { NotificationsModal } from "@/features/admin/notifications/NotificationsModal";


type HeaderProps = {
  title: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  showUser?: boolean;
  onViewReadings?: (id: string) => void;
  onSendReminder?: (id: string) => void;
  onViewBatch?: (id: string) => void;
};


export function Header({
  title,
  subtitle,
  userName = "Patrick Smith",
  userRole = "Admin-001",
  showUser = true,
  onViewReadings,
  onSendReminder,
  onViewBatch,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);



  return (
    <header className="flex items-start justify-between">
      <div className="flex items-start">
        <span className="w-[calc(var(--sidebar-w)+var(--content-gap))] shrink-0 text-2xl font-semibold">DEYO</span>
        <div>
          <h1 className="text-2xl font-bold pb-2">{title}</h1>
          {subtitle && <p className="text-base">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setNotifOpen(true)}
          aria-haspopup="dialog"
          className="flex h-16 w-10 items-center justify-center rounded-lg border border-brand-purple-50 text-brand-purple-50"
        >
          <img src={notificationIcon} alt="Notifications" className="size-6" />
        </button>

        {showUser && (
          <div className="flex items-center gap-2 rounded-lg bg-brand-purple-50 py-4 pl-8 pr-8 text-white">

            <img src={avatar} alt="Avatar" className="size-10 rounded-full mr-2" />
            <div className="leading-tight">
              <p className="text-md font-semibold">{userName}</p>
              <p className="font-mono text-sm">{userRole}</p>
            </div>
          </div>
        )}
      </div>


      <NotificationsModal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onViewReadings={onViewReadings}
        onSendReminder={onSendReminder}
        onViewBatch={onViewBatch}
      />
    </header>
  );
}