"use client";

import { useFormStatus } from "react-dom";

// 管理画面のフォーム部品。見た目を1か所に集めて各画面で使い回す。
export const adminInput =
  "w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-navy-800 outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20";

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
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "danger";
}) {
  const { pending } = useFormStatus();

  const style =
    variant === "danger"
      ? "bg-white text-shoot-500 border border-shoot-500/40 hover:bg-shoot-50"
      : "bg-navy-800 text-white hover:bg-navy-700";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full px-6 py-2.5 text-sm font-bold transition-colors disabled:opacity-60 ${style}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
