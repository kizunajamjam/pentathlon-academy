import { ImageIcon } from "lucide-react";

/*
 * 写真が入る場所を示すプレースホルダ。
 *
 * 写真素材が未入手のあいだ、ストック写真で埋めると
 * 「実際の練習風景」と誤解される見せ方になってしまうため、
 * 意図的に「ここに写真が入る」と分かる形にしている。
 *
 * 素材が届いたらこのコンポーネントを next/image に置き換える。
 * grep 対象: <PhotoSlot
 */
export function PhotoSlot({
  label,
  className = "",
  ratio = "aspect-[4/3]",
}: {
  label: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-navy-200 bg-navy-50 text-navy-400 ${ratio} ${className}`}
    >
      <ImageIcon size={28} strokeWidth={1.5} />
      <span className="px-4 text-center text-xs leading-relaxed">{label}</span>
    </div>
  );
}
