"use client";

import Link from "next/link";
import { use, useActionState } from "react";

import { keepInputsOnSubmit } from "@/lib/form-submit";
import { AlertCircle, Info } from "lucide-react";

import { LogoMark } from "@/components/layout/site-logo";
import { signIn, type LoginState } from "./actions";

const INITIAL: LoginState = {};

// メールのリンク（/admin/auth/callback）から戻されたときの案内
const LINK_NOTICES: Record<string, { tone: "error" | "info"; text: string }> = {
  invalid: {
    tone: "error",
    text: "リンクが無効か、有効期限が切れています。お手数ですが、パスワードの再設定をもう一度お申し込みください（メールのリンクは、申し込んだのと同じブラウザで開いてください）。",
  },
  email: {
    tone: "info",
    text: "確認リンクを開きました。変更が完了していれば、新しいメールアドレスでログインできます。",
  },
  "email-partial": {
    tone: "info",
    text: "確認を受け付けました。もう一方のメールアドレスにも確認メールが届いているので、そちらのリンクも開くと変更が完了します。",
  },
};

const inputClass =
  "w-full rounded-md border border-border bg-white px-4 py-3 text-base text-navy-800 outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20";

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  const [state, formAction, pending] = useActionState(signIn, INITIAL);
  const { link } = use(searchParams);
  const notice = link ? LINK_NOTICES[link] : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-800 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-black p-1.5">
            <LogoMark size={56} className="h-full w-full object-contain" />
          </span>
          <h1 className="mt-5 font-display text-lg text-white">管理画面</h1>
          <p className="mt-1.5 text-xs text-navy-300">ペンタスロンアカデミー</p>
        </div>

        <form action={formAction} onSubmit={keepInputsOnSubmit(formAction)} className="mt-8 rounded-card bg-white p-7 shadow-lg">
          {notice && !state.message && (
            <p
              className={`mb-5 flex items-start gap-2.5 rounded-md border px-4 py-3 text-sm leading-relaxed ${
                notice.tone === "error"
                  ? "border-shoot-500/30 bg-shoot-50 text-shoot-700"
                  : "border-navy-200 bg-navy-50 text-navy-800"
              }`}
            >
              {notice.tone === "error" ? (
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
              ) : (
                <Info size={17} className="mt-0.5 shrink-0" />
              )}
              {notice.text}
            </p>
          )}
          {state.message && (
            <p className="mb-5 flex items-start gap-2.5 rounded-md border border-shoot-500/30 bg-shoot-50 px-4 py-3 text-sm leading-relaxed text-shoot-700">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              {state.message}
            </p>
          )}

          <label htmlFor="email" className="text-sm font-bold text-navy-800">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={`mt-2 ${inputClass}`}
          />

          <label htmlFor="password" className="mt-5 block text-sm font-bold text-navy-800">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={`mt-2 ${inputClass}`}
          />

          <button
            type="submit"
            disabled={pending}
            className="mt-7 w-full rounded-full bg-navy-800 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
          >
            {pending ? "確認中..." : "ログイン"}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link
            href="/admin/forgot-password"
            className="text-xs text-navy-300 underline underline-offset-4 hover:text-white"
          >
            パスワードを忘れた方
          </Link>
        </p>
      </div>
    </div>
  );
}
