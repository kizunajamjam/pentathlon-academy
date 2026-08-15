"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Inbox, Megaphone, Trophy } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "ダッシュボード", icon: Home },
  { href: "/admin/news", label: "お知らせ", icon: Megaphone },
  { href: "/admin/schedule", label: "練習スケジュール", icon: CalendarDays },
  { href: "/admin/events", label: "大会・イベント", icon: Trophy },
  { href: "/admin/inquiries", label: "お問い合わせ", icon: Inbox },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2.5 text-sm transition-colors ${
              active ? "bg-navy-800 text-white" : "text-navy-700 hover:bg-navy-50"
            }`}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
