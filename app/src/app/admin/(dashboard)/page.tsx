import Link from "next/link";
import { ArrowRight, CalendarDays, Inbox, Megaphone, Trophy } from "lucide-react";

import { requireStaff } from "@/lib/auth-guard";
import { listAllNews } from "@/lib/db/news";
import { listAllEvents, listUpcomingEvents } from "@/lib/db/events";
import { listActiveSlots } from "@/lib/db/schedule";
import { listInquiries } from "@/lib/db/inquiries";

export default async function AdminDashboardPage() {
  const staff = await requireStaff();

  const [news, events, upcoming, slots, inquiries] = await Promise.all([
    listAllNews(),
    listAllEvents(),
    listUpcomingEvents(),
    listActiveSlots(),
    listInquiries(),
  ]);

  const unhandled = inquiries.filter((i) => !i.isHandled).length;

  const cards = [
    {
      href: "/admin/news",
      icon: Megaphone,
      label: "お知らせ",
      value: `${news.length} 件`,
      sub: `公開中 ${news.filter((n) => n.isPublished).length} 件`,
    },
    {
      href: "/admin/schedule",
      icon: CalendarDays,
      label: "練習スケジュール",
      value: `${slots.length} 枠`,
      sub: "毎週の練習枠",
    },
    {
      href: "/admin/events",
      icon: Trophy,
      label: "大会・イベント",
      value: `${events.length} 件`,
      sub: `開催予定 ${upcoming.length} 件`,
    },
    {
      href: "/admin/inquiries",
      icon: Inbox,
      label: "お問い合わせ",
      value: `${inquiries.length} 件`,
      sub: unhandled > 0 ? `未対応 ${unhandled} 件` : "未対応なし",
      alert: unhandled > 0,
    },
  ];

  return (
    <>
      <h1 className="text-xl text-navy-800">{staff.name} さん、お疲れさまです</h1>
      <p className="mt-3 text-sm text-muted">
        サイトに表示する内容をここから更新できます。
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className={`group rounded-card border bg-white p-6 transition-colors hover:border-navy-800 ${
                c.alert ? "border-gold-400" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-sm font-bold text-navy-800">
                  <Icon size={18} className="text-gold-600" />
                  {c.label}
                </span>
                <ArrowRight
                  size={16}
                  className="text-navy-300 transition-transform group-hover:translate-x-1"
                />
              </div>
              <p className="mt-4 font-display text-2xl font-bold text-navy-800">{c.value}</p>
              <p className={`mt-1 text-xs ${c.alert ? "text-gold-700" : "text-muted"}`}>{c.sub}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
