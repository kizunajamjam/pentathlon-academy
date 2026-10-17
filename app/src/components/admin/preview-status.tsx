// プレビューで、その内容がいまサイトに出ているかどうかを示す帯
export function PreviewStatus({ isPublished, publishAt }: { isPublished: boolean; publishAt?: string }) {
  const scheduled = isPublished && publishAt !== undefined && publishAt > new Date().toISOString();
  const [label, note, tone] = !isPublished
    ? ["下書き", "まだサイトには出ていません。「サイトに公開する」にチェックして保存すると公開されます。", "bg-navy-100 text-navy-700"]
    : scheduled
      ? ["予約", "公開日時になると、この見た目でサイトに出ます。", "bg-gold-100 text-gold-700"]
      : ["公開中", "この内容がいまサイトに出ています。", "bg-success-50 text-success-500"];

  return (
    <div className="border-b border-border bg-surface">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 text-xs text-navy-700">
        <span className={`rounded-full px-2.5 py-0.5 font-bold ${tone}`}>{label}</span>
        {note}
      </p>
    </div>
  );
}
