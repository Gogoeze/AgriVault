import { NavLink } from "react-router-dom";
import type { ComponentType, SVGProps } from "react";
import avatar from "@/shared/assets/avatar.jpg";




export type SidebarUser = { name: string; role: string };


export type NavItem = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
  end?: boolean;
};

export function Sidebar({ items, user }: { items: NavItem[]; user?: SidebarUser }) {
  const nav = (
    <aside className="w-[var(--sidebar-w)] shrink-0 rounded-r-xl bg-brand-purple-50 p-4 self-start">
      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          // 3. Extract the icon component dynamically
          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-md font-semibold ${isActive
                  ? "bg-brand-purple-30 text-brand-purple-50"
                  : "text-white hover:bg-white/10"
                }`
              }
            >
              {/* 4. Render it with standard sizing utilities */}
              <IconComponent className="h-6 w-6 fill-current" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
    );

  if (!user) return nav;

  return (
    <div className="flex w-[var(--sidebar-w)] shrink-0 flex-col justify-between self-stretch">
      {nav}
      <div className="flex items-center gap-2 rounded-lg bg-brand-purple-30 p-2 text-white">
        <img src={avatar} alt="" className="size-8 rounded-full" />
        <div className="leading-tight">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs">{user.role}</p>
        </div>
      </div>
    </div>
  );
}
