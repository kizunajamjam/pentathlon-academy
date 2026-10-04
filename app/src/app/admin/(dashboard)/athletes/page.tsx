import Link from "next/link";
import { Plus } from "lucide-react";

import { listAllAthletes } from "@/lib/db/athletes";

export default async function AdminAthletesPage() {
  const items = await listAllAthletes();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl text-navy-800">強化選手</h1>
        <Link
          href="/admin/athletes/new"
          className="flex items-center gap-1.5 rounded-full bg-navy-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-700"
        >
          <Plus size={16} />
          追加
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-border bg-white">
        {items.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-muted">
            まだ登録がありません。「追加」から登録してください。
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/admin/athletes/${a.id}`}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-navy-50/60 sm:flex-row sm:items-center sm:gap-5"
                >
                  <span className="flex-1 text-sm font-bold text-navy-800">{a.name}</span>
                  <span className="text-xs text-muted">{a.designation}</span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs sm:w-20 sm:text-center ${
                      a.isPublished ? "bg-success-50 text-success-500" : "bg-navy-100 text-navy-600"
                    }`}
                  >
                    {a.isPublished ? "公開中" : "非公開"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
