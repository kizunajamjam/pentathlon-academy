import { STANDARD_LEVELS, type Standard } from "@/lib/constants/site";

/*
 * 1種目ぶんの強化選手標準記録（男女の表＋共通のプラス評価）。
 *
 * 入会条件ではなく目安なので、王冠やゴールド調の装飾は付けず、
 * サイトの他の表と同じ落ち着いた見た目に揃えている。
 *
 * 以前は横スクロールで逃がしていたが、スマホで指を横に動かさないと
 * B の列が見えず、表として成立していなかった。table-fixed で列幅を
 * 割合で決め打ちし、一番狭い画面でも4列すべてが収まるようにしている。
 * 種目名と段階の補足ラベルは、収まらなければ2行に折り返してよい。
 */
export function Standards({ standard }: { standard: Standard }) {
  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {standard.groups.map((group) => (
          // min-w-0 がないと、表の最小幅がグリッドの列を押し広げてページ全体が
          // 横スクロールしてしまう（グリッド項目の既定の最小幅は auto のため）
          <div key={group.gender} className="min-w-0">
            <h4 className="font-display text-base font-bold text-navy-800">{group.gender}</h4>

            <table className="mt-3 w-full table-fixed border-collapse text-[13px] sm:text-sm">
              <thead>
                <tr className="border-b border-border">
                  {/* 残り 3 列が均等に 20% ずつ取れる幅。時計表記は 7 桁が最長。 */}
                  <th className="w-[40%] py-3 pr-2 text-left font-normal text-muted">種目</th>
                  {STANDARD_LEVELS.map((lv) => (
                    <th
                      key={lv.label}
                      className="px-1 py-3 text-right font-bold text-navy-800 sm:px-2"
                    >
                      {lv.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.events.map((ev) => (
                  <tr key={ev.name} className="border-b border-border">
                    <td className="py-3 pr-2 leading-tight text-navy-700">{ev.name}</td>
                    {ev.times.map((t, i) => (
                      <td
                        key={STANDARD_LEVELS[i].label}
                        className="px-1 py-3 text-right font-display tabular-nums text-navy-800 sm:px-2"
                      >
                        {t}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/*
              段階の呼び名は表の見出しに入れると列幅を押し広げ、
              「トップレベ / ル」のように1文字だけ折り返してしまう。
              表の外に出し、1項目ずつを nowrap にして語の途中で折れないようにする。
            */}
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
              {STANDARD_LEVELS.map((lv) => (
                <span key={lv.label} className="whitespace-nowrap">
                  <span className="font-display font-bold text-navy-800">{lv.label}</span> {lv.sub}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      {/* プラス評価は男女共通。表の下にまとめて1つだけ出す。 */}
      {standard.plus.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-bold text-navy-800">プラス評価（男女共通）</p>
          <ul className="mt-2 space-y-1.5">
            {standard.plus.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
