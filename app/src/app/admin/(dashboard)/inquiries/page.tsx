import { Check, Mail, Phone, RotateCcw } from "lucide-react";

import { listInquiries } from "@/lib/db/inquiries";
import { formatDateDot, formatTime } from "@/lib/utils/date";
import { toggleHandled } from "./actions";

export default async function AdminInquiriesPage() {
  const inquiries = await listInquiries();
  const unhandled = inquiries.filter((i) => !i.isHandled).length;

  return (
    <>
      <h1 className="text-xl text-navy-800">お問い合わせ</h1>
      <p className="mt-3 text-sm text-muted">
        {inquiries.length > 0
          ? `全 ${inquiries.length} 件 / 未対応 ${unhandled} 件`
          : "受信したお問い合わせがここに表示されます。"}
      </p>

      <div className="mt-6 space-y-4">
        {inquiries.length === 0 && (
          <p className="rounded-card border border-border bg-white px-6 py-14 text-center text-sm text-muted">
            まだお問い合わせはありません。
          </p>
        )}

        {inquiries.map((q) => (
          <article
            key={q.id}
            className={`rounded-card border bg-white p-6 ${
              q.isHandled ? "border-border opacity-70" : "border-gold-300"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-navy-800 px-3 py-1 text-xs text-gold-400">
                {q.category}
              </span>
              <span className="font-display text-xs text-muted">
                {formatDateDot(q.createdAt)} {formatTime(q.createdAt)}
              </span>
              {q.isHandled ? (
                <span className="rounded-full bg-success-50 px-2.5 py-0.5 text-xs text-success-500">
                  対応済み
                </span>
              ) : (
                <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs text-gold-700">
                  未対応
                </span>
              )}
            </div>

            <p className="mt-4 text-base font-bold text-navy-800">{q.name} 様</p>

            <ul className="mt-3 space-y-1.5 text-sm">
              <li className="flex items-center gap-2 text-navy-700">
                <Mail size={14} className="shrink-0 text-gold-600" />
                {/* 返信しやすいよう mailto にしておく */}
                <a href={`mailto:${q.email}`} className="break-all hover:text-gold-600">
                  {q.email}
                </a>
              </li>
              {q.phone && (
                <li className="flex items-center gap-2 text-navy-700">
                  <Phone size={14} className="shrink-0 text-gold-600" />
                  <a href={`tel:${q.phone}`} className="hover:text-gold-600">
                    {q.phone}
                  </a>
                </li>
              )}
            </ul>

            <p className="mt-5 whitespace-pre-wrap rounded-md bg-surface px-4 py-3.5 text-sm leading-relaxed text-navy-700">
              {q.message}
            </p>

            <form action={toggleHandled} className="mt-5">
              <input type="hidden" name="id" value={q.id} />
              <input type="hidden" name="next" value={String(!q.isHandled)} />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-navy-700 transition-colors hover:border-navy-800 hover:bg-navy-50"
              >
                {q.isHandled ? (
                  <>
                    <RotateCcw size={14} />
                    未対応に戻す
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    対応済みにする
                  </>
                )}
              </button>
            </form>
          </article>
        ))}
      </div>
    </>
  );
}
