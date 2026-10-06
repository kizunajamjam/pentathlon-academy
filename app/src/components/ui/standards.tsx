import { STANDARD_LEVELS, type Standard } from "@/lib/constants/site";

/*
 * 1種目ぶんの強化選手規定。記録で判定する種目は男女の表、ランキング・成績で判定する種目は順位の表。
 *
 * 入会条件ではなく目安なので、王冠やゴールド調の装飾は付けず、
 * サイトの他の表と同じ落ち着いた見た目に揃えている。
 *
 * 以前は横スクロールで逃がしていたが、スマホで指を横に動かさないと
 * B の列が見えず、表として成立していなかった。table-fixed で列幅を
 * 割合で決め打ちし、一番狭い画面でも4列すべてが収まるようにしている。
 * 種目名と段階の補足ラベルは、収まらなければ2行に折り返してよい。
 */
function Notes({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;
  return (
    <ul className="mx-auto mt-6 max-w-3xl space-y-1.5">
      {notes.map((n) => (
        <li key={n} className="flex items-start gap-2 text-sm text-muted">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
          {n}
        </li>
      ))}
    </ul>
  );
}

function RankingTable({ standard }: { standard: Extract<Standard, { kind: "ranking" }> }) {
  return (
    <div className="mx-auto max-w-sm">
      {standard.target && (
        <p className="mb-3 text-left text-sm text-navy-800">
          <span className="font-bold">対象：</span>
          {standard.target}
        </p>
      )}
      <p className="text-left text-sm leading-relaxed text-navy-700">{standard.lead}</p>
      <table className="mt-4 w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="w-[40%] py-3 text-center font-normal text-muted">ランク</th>
            <th className="py-3 text-center font-normal text-muted">{standard.column}</th>
          </tr>
        </thead>
        <tbody>
          {STANDARD_LEVELS.map((lv, i) => (
            <tr key={lv.label} className="border-b border-border">
              <td className="py-3 text-center font-display font-bold text-navy-800">{lv.label}</td>
              <td className="py-3 text-center font-display tabular-nums text-navy-800">
                {standard.ranks[i]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Notes notes={standard.notes} />
    </div>
  );
}

export function Standards({ standard }: { standard: Standard }) {
  if (standard.kind === "ranking") return <RankingTable standard={standard} />;

  return (
    <div>
      {standard.lead && (
        <p className="mx-auto mb-6 max-w-3xl text-left text-sm leading-relaxed text-navy-700">{standard.lead}</p>
      )}
      <div className="mx-auto grid max-w-3xl gap-8 lg:grid-cols-2 lg:gap-10">
        {standard.groups.map((group) => (
          // min-w-0 がないと、表の最小幅がグリッドの列を押し広げてページ全体が
          // 横スクロールしてしまう（グリッド項目の既定の最小幅は auto のため）
          <div key={group.gender} className="min-w-0">
            <h4 className="text-center font-display text-base font-bold text-navy-800">{group.gender}</h4>

            <table className="mt-3 w-full table-fixed border-collapse text-[13px] sm:text-sm">
              <thead>
                <tr className="border-b border-border">
                  {/* 残り 3 列が均等に 20% ずつ取れる幅。時計表記は 7 桁が最長。 */}
                  <th className="w-[40%] py-3 pr-2 text-center font-normal text-muted">種目</th>
                  {STANDARD_LEVELS.map((lv) => (
                    <th
                      key={lv.label}
                      className="px-1 py-3 text-center font-bold text-navy-800 sm:px-2"
                    >
                      {lv.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.events.map((ev) => (
                  <tr key={ev.name} className="border-b border-border">
                    <td className="py-3 pr-2 text-center leading-tight text-navy-700">{ev.name}</td>
                    {ev.times.map((t, i) => (
                      <td
                        key={STANDARD_LEVELS[i].label}
                        className="px-1 py-3 text-center font-display tabular-nums text-navy-800 sm:px-2"
                      >
                        {t}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

                </div>
        ))}
      </div>

      <Notes notes={standard.notes} />
    </div>
  );
}
