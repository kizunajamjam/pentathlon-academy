import { Eye } from "lucide-react";

// 編集画面の「プレビュー」ボタン。保存済みの内容を、公開ページと同じ見た目で別タブに開く。
export function PreviewLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm font-bold text-navy-700 transition-colors hover:border-navy-800"
    >
      <Eye size={14} aria-hidden="true" />
      プレビュー
    </a>
  );
}
