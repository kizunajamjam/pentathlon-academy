import { ExternalLink, MapPin } from "lucide-react";

import { EVENT_CATEGORY_LABEL } from "@/lib/constants/site";
import { formatEventPeriod } from "@/lib/utils/date";
import type { AcademyEvent } from "@/types";

// 大会・イベント1件分のカード。過去分は色を落として表示する。
export function EventCard({ event, past = false }: { event: AcademyEvent; past?: boolean }) {
  return (
    <article
      className={`rounded-card border border-border bg-white p-6 ${past ? "opacity-70" : ""}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            past ? "bg-navy-100 text-navy-500" : "bg-navy-800 text-gold-400"
          }`}
        >
          {EVENT_CATEGORY_LABEL[event.category]}
        </span>
      </div>

      <h3 className="mt-4 text-lg text-navy-800">{event.title}</h3>

      <p className="mt-3 font-display text-sm text-navy-600">
        {formatEventPeriod(event.startsAt, event.endsAt)}
      </p>

      {event.location && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={14} className="shrink-0 text-gold-600" />
          {event.location}
        </p>
      )}

      {event.description && (
        <p className="mt-4 text-sm leading-relaxed text-muted">{event.description}</p>
      )}

      {event.url && (
        // 外部サイト（協会の要項ページなど）へ飛ぶので、別タブで開くことを明示する
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-navy-800 transition-colors hover:text-gold-600"
        >
          大会の詳細・要項
          <ExternalLink size={14} />
        </a>
      )}
    </article>
  );
}
