"use client";

import { useFormStatus } from "react-dom";

// 管理画面のフォーム部品。見た目を1か所に集めて各画面で使い回す。
// スマホが主な投稿環境なので、文字は 16px（iPhone は 16px 未満の入力欄に触れると画面が拡大される）、
// 高さも指で押しやすい 48px 前後にする。PC では少し詰める。
export const adminInput =
  "w-full rounded-md border border-border bg-white px-3.5 py-3 text-base text-navy-800 outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 sm:py-2.5 sm:text-sm";

export function AdminField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-bold text-navy-800">
        {label}
      </label>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

// 送信中は二重送信を防ぐためボタンを無効化する。
export function SubmitButton({
  children,
  pendingLabel = "保存中...",
  variant = "primary",
  pending: pendingProp = false,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "danger";
  // useActionState の送信中フラグ。onSubmit から送るフォーム（lib/form-submit.ts）でも
  // 確実に二重送信を防ぐため、useFormStatus と両方を見る
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp || status.pending;

  const style =
    variant === "danger"
      ? "bg-white text-shoot-500 border border-shoot-500/40 hover:bg-shoot-50"
      : "bg-navy-800 text-white hover:bg-navy-700";

  return (
    <button
      type="submit"
      disabled={pending}
      // スマホでは横いっぱい・高さ 48px にして、親指で押しやすくする
      className={`w-full rounded-full px-6 py-3.5 text-base font-bold transition-colors disabled:opacity-60 sm:w-auto sm:py-2.5 sm:text-sm ${style}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
