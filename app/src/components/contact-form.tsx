"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

import { submitInquiry, type ContactState } from "@/app/(site)/contact/actions";
import { INQUIRY_CATEGORIES } from "@/lib/constants/site";

const INITIAL: ContactState = { status: "idle" };

const inputClass =
  "w-full rounded-md border border-border bg-white px-4 py-3 text-sm text-navy-800 outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-shoot-500">{message}</p>;
}

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-bold text-navy-800">
      {children}
      {required && (
        <span className="rounded bg-shoot-500 px-1.5 py-0.5 text-[10px] font-normal text-white">
          必須
        </span>
      )}
    </label>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, INITIAL);

  if (state.status === "success") {
    return (
      <div className="rounded-card border border-success-500/30 bg-success-50 px-6 py-12 text-center">
        <CheckCircle2 size={40} className="mx-auto text-success-500" />
        <h2 className="mt-5 text-xl text-navy-800">送信が完了しました</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          お問い合わせありがとうございます。
          <br />
          内容を確認のうえ、担当者よりご連絡いたします。
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && state.message && (
        <p className="flex items-start gap-2.5 rounded-md border border-shoot-500/30 bg-shoot-50 px-4 py-3.5 text-sm leading-relaxed text-shoot-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {state.message}
        </p>
      )}

      <div>
        <Label htmlFor="name" required>
          お名前
        </Label>
        <input id="name" name="name" type="text" maxLength={100} className={`mt-2 ${inputClass}`} />
        <FieldError message={state.fieldErrors?.name} />
      </div>

      <div>
        <Label htmlFor="email" required>
          メールアドレス
        </Label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          maxLength={254}
          className={`mt-2 ${inputClass}`}
        />
        <FieldError message={state.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="phone">電話番号</Label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          maxLength={30}
          className={`mt-2 ${inputClass}`}
        />
      </div>

      <div>
        <Label htmlFor="category" required>
          お問い合わせ種別
        </Label>
        <select id="category" name="category" defaultValue="" className={`mt-2 ${inputClass}`}>
          <option value="" disabled>
            選択してください
          </option>
          {INQUIRY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <FieldError message={state.fieldErrors?.category} />
      </div>

      <div>
        <Label htmlFor="message" required>
          お問い合わせ内容
        </Label>
        <textarea
          id="message"
          name="message"
          rows={7}
          maxLength={2000}
          className={`mt-2 resize-y ${inputClass}`}
        />
        <FieldError message={state.fieldErrors?.message} />
      </div>

      {/* ハニーポット: 人間には見えない。bot が埋めると送信を破棄する。 */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gold-500 px-6 py-4 text-sm font-bold text-navy-900 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {pending ? "送信中..." : "この内容で送信する"}
      </button>
    </form>
  );
}
