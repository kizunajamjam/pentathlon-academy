import Link from "next/link";
import { Plus } from "lucide-react";

import { DAY_LABEL, DISCIPLINES } from "@/lib/constants/site";
import { listAllSlots } from "@/lib/db/schedule";

export default async function AdminSchedulePage() {
  const slots = await listAllSlots();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl text-navy-800">練習スケジュール</h1>
        <Link
          href="/admin/schedule/new"
          className="flex items-center gap-1.5 rounded-full bg-navy-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-700"
        >
          <Plus size={16} />
          枠を追加
        </Link>
      </div>

      <p className="mt-3 text-sm text-muted">
        毎週繰り返す練習の枠です。単発の予定は「大会・イベント」から登録してください。
      </p>

      <div className="mt-6 overflow-hidden rounded-card border border-border bg-white">
        {slots.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-muted">
            まだ枠がありません。「枠を追加」から登録してください。
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {slots.map((s) => {
              const discipline = DISCIPLINES.find((d) => d.id === s.discipline);

              return (
                <li key={s.id}>
                  <Link
                    href={`/admin/schedule/${s.id}`}
                    className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-navy-50/60 sm:flex-row sm:items-center sm:gap-5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-800 font-display text-xs font-bold text-white">
                      {DAY_LABEL[s.dayOfWeek]}
                    </span>
                    <span className="shrink-0 font-display text-sm text-navy-800 sm:w-32">
                      {s.startTime} 〜 {s.endTime}
                    </span>
                    <span className="flex-1 text-sm text-navy-800">
                      {s.className}
                      {discipline && (
                        <span className={`ml-2.5 text-xs ${discipline.text}`}>
                          {discipline.name}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-muted sm:w-40">{s.location}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs sm:w-16 sm:text-center ${
                        s.isActive ? "bg-success-50 text-success-500" : "bg-navy-100 text-navy-600"
                      }`}
                    >
                      {s.isActive ? "表示" : "休止"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
