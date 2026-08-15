import { SWIM_LEVELS, SWIM_STANDARDS } from "@/lib/constants/site";

/*
 * 水泳の強化選手チャレンジ基準。
 *
 * 入会条件ではなく目安なので、王冠やゴールド調の装飾は付けず、
 * サイトの他の表と同じ落ち着いた見た目に揃えている。
 * 表は列が多く狭い画面で潰れるため、横スクロールできるようにしている。
 */
export function SwimStandards() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      {SWIM_STANDARDS.map((group) => (
        // min-w-0 がないと、表の最小幅がグリッドの列を押し広げてページ全体が
        // 横スクロールしてしまう（グリッド項目の既定の最小幅は auto のため）
        <div key={group.gender} className="min-w-0">
          <h3 className="font-display text-base font-bold text-navy-800">{group.gender}</h3>

          <div className="mt-3 overflow-x-auto">
            {/* 見出しが「ゴール/ド」のように途中で折り返さないよう nowrap を効かせる */}
            <table className="w-full min-w-[27rem] border-collapse whitespace-nowrap text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-3 text-left font-normal text-muted">種目</th>
                  {SWIM_LEVELS.map((lv) => (
                    <th key={lv.label} className="px-2 py-3 text-right font-bold text-navy-800">
                      {lv.label}
                      <span className="mt-0.5 block text-[10px] font-normal text-muted">
                        {lv.sub}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.events.map((ev) => (
                  <tr key={ev.name} className="border-b border-border">
                    <td className="py-3 pr-3 text-navy-700">{ev.name}</td>
                    {ev.times.map((t, i) => (
                      <td
                        key={SWIM_LEVELS[i].label}
                        className="px-2 py-3 text-right font-display tabular-nums text-navy-800"
                      >
                        {t}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-muted">いずれも記録は「以内」が目安です。</p>

          <p className="mt-5 text-sm font-bold text-navy-800">プラス評価</p>
          <ul className="mt-2 space-y-1.5">
            {group.plus.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
