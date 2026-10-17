"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, GraduationCap, Home, Inbox, Medal, Megaphone, Trophy } from "lucide-react";

// short はスマホ用の短い名前（4列に並べるため）
const ITEMS = [
  { href: "/admin", label: "ダッシュボード", short: "ホーム", icon: Home },
  { href: "/admin/news", label: "お知らせ", short: "お知らせ", icon: Megaphone },
  { href: "/admin/schedule", label: "練習スケジュール", short: "練習", icon: CalendarDays },
  { href: "/admin/events", label: "大会・イベント", short: "大会", icon: Trophy },
  { href: "/admin/coaches", label: "指導者", short: "指導者", icon: GraduationCap },
  { href: "/admin/athletes", label: "強化選手", short: "選手", icon: Medal },
  { href: "/admin/inquiries", label: "お問い合わせ", short: "問い合わせ", icon: Inbox },
  { href: "/admin/analytics", label: "分析", short: "分析", icon: BarChart3 },
];

export function AdminNav() {
  const pathname = usePathname();

  /*
   * スマホでは 4列×2段に並べ、全部の項目が一度に見えるようにする
   * （横スクロールだと、画面外の項目があることに気づきにくい）。PC では横一列。
   */
  return (
    <nav className="grid grid-cols-4 gap-1 sm:flex sm:overflow-x-auto">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-14 shrink-0 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[11px] transition-colors sm:min-h-0 sm:flex-row sm:gap-2 sm:px-3.5 sm:py-2.5 sm:text-sm ${
              active ? "bg-navy-800 text-white" : "text-navy-700 hover:bg-navy-50"
            }`}
          >
            <Icon size={18} className="sm:size-4" aria-hidden="true" />
            <span className="sm:hidden">{item.short}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
