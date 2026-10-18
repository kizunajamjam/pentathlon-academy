"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, MailCheck } from "lucide-react";

import { keepInputsOnSubmit } from "@/lib/form-submit";
import { LogoMark } from "@/components/layout/site-logo";
import { requestPasswordReset, type ForgotState } from "./actions";

const INITIAL: ForgotState = {};

const inputClass =
  "w-full rounded-md border border-border bg-white px-4 py-3 text-base text-navy-800 outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20";

export default function AdminForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, INITIAL);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-800 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-black p-1.5">
            <LogoMark size={56} className="h-full w-full object-contain" />
          </span>
          <h1 className="mt-5 font-display text-lg text-white">パスワードの再設定</h1>
          <p className="mt-1.5 text-xs text-navy-300">ペンタスロンアカデミー 管理画面</p>
        </div>

        {state.sent ? (
          <div className="mt-8 rounded-card bg-white p-7 shadow-lg">
            <p className="flex items-start gap-2.5 text-sm leading-relaxed text-navy-800">
              <MailCheck size={18} className="mt-0.5 shrink-0 text-gold-600" />
              登録されているメールアドレスであれば、再設定用のメールを送りました。
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              メール内のリンクを、<strong className="text-navy-800">この画面を開いているのと同じブラウザ</strong>
              で開いてください。認証アプリのコードを入れたあと、新しいパスワードを決められます。
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              数分待っても届かないときは、迷惑メールのフォルダも確かめてください。
            </p>
          </div>
        ) : (
          <form
            action={formAction}
            onSubmit={keepInputsOnSubmit(formAction)}
            className="mt-8 rounded-card bg-white p-7 shadow-lg"
          >
            {state.message && (
              <p className="mb-5 flex items-start gap-2.5 rounded-md border border-shoot-500/30 bg-shoot-50 px-4 py-3 text-sm leading-relaxed text-shoot-700">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                {state.message}
              </p>
            )}

            <p className="mb-5 text-sm leading-relaxed text-muted">
              管理画面に登録しているメールアドレスを入力してください。再設定用のリンクをお送りします。
            </p>

            <label htmlFor="email" className="text-sm font-bold text-navy-800">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`mt-2 ${inputClass}`}
            />

            <button
              type="submit"
              disabled={pending}
              className="mt-7 w-full rounded-full bg-navy-800 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
            >
              {pending ? "送信中..." : "再設定メールを送る"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center">
          <Link href="/admin/login" className="text-xs text-navy-300 underline underline-offset-4 hover:text-white">
            ログイン画面に戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
