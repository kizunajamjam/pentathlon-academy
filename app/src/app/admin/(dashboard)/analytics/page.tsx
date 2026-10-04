import { Download } from "lucide-react";

import { listInquiries } from "@/lib/db/inquiries";
import { summarizeInquiries, type Count } from "@/lib/analytics/inquiries";

// 横棒グラフ。最大値を 100% とし、数値は必ず文字でも出す（色や長さだけに頼らない）。
function Bars({ rows, empty }: { rows: Count[]; empty: string }) {
  if (rows.length === 0 || rows.every((r) => r.count === 0)) {
    return <p className="text-sm text-muted">{empty}</p>;
  }
  const max = Math.max(...rows.map((r) => r.count));

  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,10rem)_1fr_2.5rem] items-center gap-3">
          <span className="truncate text-sm text-navy-700" title={r.label}>
            {r.label}
          </span>
          <span className="h-2.5 rounded-full bg-navy-50">
            <span
              className="block h-full rounded-full bg-navy-800"
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </span>
          <span className="text-right font-display text-sm font-bold tabular-nums text-navy-800">
            {r.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-white p-6">
      <h2 className="text-sm font-bold text-navy-800">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Stat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={`rounded-card border bg-white p-5 ${alert ? "border-gold-400" : "border-border"}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-navy-800">{value}</p>
    </div>
  );
}

function formatHours(h: number | null): string {
  if (h === null) return "—";
  if (h < 1) return "1時間未満";
  if (h < 48) return `${Math.round(h)}時間`;
  return `${(h / 24).toFixed(1)}日`;
}

export default async function AdminAnalyticsPage() {
  const inquiries = await listInquiries();
  const s = summarizeInquiries(inquiries);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl text-navy-800">分析</h1>
        <a
          href="/admin/inquiries/export"
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-navy-700 transition-colors hover:border-navy-800 hover:bg-navy-50"
        >
          <Download size={14} />
          お問い合わせをCSVで保存
        </a>
      </div>
      <p className="mt-3 text-sm text-muted">
        お問い合わせの集計です。ページごとのアクセス数は、解析サービス（Plausible）の画面で確認できます。
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="お問い合わせ（累計）" value={`${s.total} 件`} />
        <Stat
          label="未対応"
          value={`${s.unhandled} 件`}
          alert={s.overdue > 0}
        />
        <Stat
          label="対応済みの割合"
          value={s.handledRate === null ? "—" : `${Math.round(s.handledRate * 100)}%`}
        />
        <Stat label="対応までの時間（中央値）" value={formatHours(s.medianResponseHours)} />
      </div>
      {s.overdue > 0 && (
        <p className="mt-3 text-sm text-gold-700">
          受信から2日以上たっても未対応のものが {s.overdue} 件あります。
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="週ごとの件数（直近12週）">
          <Bars rows={s.weekly.map((w) => ({ label: `${w.label} 〜`, count: w.count }))} empty="まだ件数がありません。" />
        </Panel>
        <Panel title="種別">
          <Bars rows={s.byCategory} empty="まだ件数がありません。" />
        </Panel>
        <Panel title="どこから来たか（流入元）">
          <Bars rows={s.bySource} empty="まだ件数がありません。" />
        </Panel>
        <Panel title="最初に開いたページ">
          <Bars rows={s.byLanding} empty="まだ件数がありません。" />
        </Panel>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        流入元は、問い合わせを送った訪問で最初に開いたページの情報です。URL に
        <code className="mx-1 rounded bg-navy-50 px-1">?utm_source=instagram</code>
        のように付けたリンクをSNSなどに載せると、その名前で集計されます。付けていない場合はリンク元のサイト名、どちらも無ければ「直接・不明」になります。
      </p>
    </>
  );
}
