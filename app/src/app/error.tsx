"use client";

import { useEffect } from "react";

// データの読み取りに失敗したときの表示。空の一覧に見せかけて
// 障害を隠さないよう、はっきり「読み込めなかった」と伝える。
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-bold text-navy-800">ページを読み込めませんでした</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        一時的に情報を取得できない状態です。少し時間をおいてから、もう一度お試しください。
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-navy-800 px-6 py-2.5 text-sm text-white transition-colors hover:bg-navy-700"
      >
        再読み込み
      </button>
    </div>
  );
}
