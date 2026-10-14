"use client";

import { useActionState, useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";

import { keepInputsOnSubmit } from "@/lib/form-submit";
import { confirmEnroll, startEnroll, verifyMfa, type MfaState } from "./actions";

const INITIAL: MfaState = {};

const inputClass =
  "w-full rounded-md border border-border bg-white px-4 py-3 text-center font-display text-xl tracking-[0.4em] text-navy-800 outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20";
const buttonClass =
  "mt-6 w-full rounded-full bg-navy-800 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-navy-700 disabled:opacity-60";

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mb-5 flex items-start gap-2.5 rounded-md border border-shoot-500/30 bg-shoot-50 px-4 py-3 text-sm leading-relaxed text-shoot-700">
      <AlertCircle size={17} className="mt-0.5 shrink-0" />
      {message}
    </p>
  );
}

// 6桁のコード入力欄。スマホでは数字キーボードが出て、SMS ではなく認証アプリの値を入れる
function CodeInput() {
  return (
    <>
      <label htmlFor="code" className="text-sm font-bold text-navy-800">
        6桁のコード
      </label>
      <input
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        required
        className={`mt-2 ${inputClass}`}
      />
    </>
  );
}

export function MfaForm({ mode }: { mode: "verify" | "setup" }) {
  return mode === "verify" ? <VerifyForm /> : <SetupForm />;
}

function VerifyForm() {
  const [state, formAction, pending] = useActionState(verifyMfa, INITIAL);
  return (
    <form
      action={formAction}
      onSubmit={keepInputsOnSubmit(formAction)}
      className="mt-8 rounded-card bg-white p-7 shadow-lg"
    >
      <ErrorMessage message={state.message} />
      <p className="mb-5 text-sm leading-relaxed text-muted">
        スマホの認証アプリ（Google Authenticator など）に表示されている数字を入力してください。
      </p>
      <CodeInput />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "確認中..." : "確認してログイン"}
      </button>
    </form>
  );
}

function SetupForm() {
  const [enroll, setEnroll] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [startError, setStartError] = useState<string>();
  const [starting, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState(confirmEnroll, INITIAL);

  const start = () =>
    startTransition(async () => {
      const result = await startEnroll();
      if ("message" in result) setStartError(result.message);
      else {
        setStartError(undefined);
        setEnroll(result);
      }
    });

  if (!enroll) {
    return (
      <div className="mt-8 rounded-card bg-white p-7 shadow-lg">
        <ErrorMessage message={startError} />
        <p className="text-sm leading-relaxed text-navy-800">
          管理画面に入るには、パスワードに加えて、スマホの認証アプリに表示される数字が必要です。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          はじめに一度だけ登録します。スマホに「Google Authenticator」などの認証アプリを入れてから進んでください。
        </p>
        <button type="button" onClick={start} disabled={starting} className={buttonClass}>
          {starting ? "準備中..." : "登録を始める"}
        </button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={keepInputsOnSubmit(formAction)}
      className="mt-8 rounded-card bg-white p-7 shadow-lg"
    >
      <ErrorMessage message={state.message} />
      <input type="hidden" name="factorId" value={enroll.factorId} />
      <p className="text-sm leading-relaxed text-navy-800">
        1. 認証アプリで、この QR コードを読み取ってください。
      </p>
      {/* QR コードは Supabase が返す SVG（data URL）。外部へは送らない */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={enroll.qrCode} alt="認証アプリ登録用の QR コード" className="mx-auto mt-4 h-48 w-48" />
      <details className="mt-3 text-xs text-muted">
        <summary className="cursor-pointer">読み取れないときは（手入力用のキー）</summary>
        <p className="mt-2 break-all rounded-md bg-surface px-3 py-2 font-mono text-navy-800">{enroll.secret}</p>
      </details>
      <p className="mt-6 mb-3 text-sm leading-relaxed text-navy-800">
        2. アプリに表示された6桁の数字を入力してください。
      </p>
      <CodeInput />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "確認中..." : "登録してログイン"}
      </button>
    </form>
  );
}
