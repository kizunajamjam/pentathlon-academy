import { Hourglass } from "lucide-react";

/*
 * 中身がまだ用意できていないセクションの枠。
 *
 * PhotoSlot と同じ考え方で、それらしい文章で埋めずに「これから入る」と
 * 分かる形にしている。憶測で書いた実績や方法論が事実として読まれるより、
 * 準備中と分かるほうが害がない。
 *
 * 中身が届いたらこのコンポーネントごと置き換える。
 * grep 対象: <PendingSlot
 */
export function PendingSlot({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-card border-2 border-dashed border-navy-200 bg-navy-50 px-6 py-12 text-center">
      <Hourglass size={24} strokeWidth={1.5} className="text-navy-400" />
      <p className="max-w-md text-sm leading-relaxed text-navy-400">{label}</p>
    </div>
  );
}
