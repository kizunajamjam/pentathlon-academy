"use client";

import { useActionState } from "react";

import { keepInputsOnSubmit } from "@/lib/form-submit";
import { AlertCircle } from "lucide-react";

import { LogoMark } from "@/components/layout/site-logo";
import { DEMO_ACCOUNT, isAdminDemo } from "@/lib/supabase/config";
import { signIn, type LoginState } from "./actions";

const INITIAL: LoginState = {};

const inputClass =
  "w-full rounded-md border border-border bg-white px-4 py-3 text-sm text-navy-800 outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(signIn, INITIAL);

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

        {isAdminDemo && (
          <div className="mt-8 rounded-card border border-gold-400/40 bg-gold-50 px-5 py-4 text-sm leading-relaxed text-navy-800">
            <p className="font-bold">デモ版の管理画面です</p>
            <p className="mt-1 text-xs text-navy-700">
              中身は見本のデータで、保存・削除をしても何も変わりません。次のアカウントで入れます。
            </p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-display text-xs">
              <dt className="text-navy-500">メール</dt>
              <dd>{DEMO_ACCOUNT.email}</dd>
              <dt className="text-navy-500">パスワード</dt>
              <dd>{DEMO_ACCOUNT.password}</dd>
            </dl>
          </div>
        )}

        <form action={formAction} onSubmit={keepInputsOnSubmit(formAction)} className="mt-8 rounded-card bg-white p-7 shadow-lg">
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
      </div>
    </div>
  );
}
