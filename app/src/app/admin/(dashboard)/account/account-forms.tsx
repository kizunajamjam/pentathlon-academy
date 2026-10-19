"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { AdminField, SubmitButton, adminInput } from "@/components/admin/form-ui";
import { keepInputsOnSubmit } from "@/lib/form-submit";
import { changeEmail, changePassword, type AccountState } from "./actions";

const INITIAL: AccountState = {};

function Result({ state }: { state: AccountState }) {
  if (state.message) {
    return (
      <p className="flex items-start gap-2.5 rounded-md border border-shoot-500/30 bg-shoot-50 px-4 py-3 text-sm leading-relaxed text-shoot-700">
        <AlertCircle size={17} className="mt-0.5 shrink-0" />
        {state.message}
      </p>
    );
  }
  if (state.done) {
    return (
      <p className="flex items-start gap-2.5 rounded-md border border-success-500/30 bg-success-50 px-4 py-3 text-sm leading-relaxed text-success-500">
        <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
        {state.done}
      </p>
    );
  }
  return null;
}

// 入力エラーでは書いた内容を残し、成功したら空に戻す（パスワードを画面に残さない）
function useClearOnDone(state: AccountState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.done) ref.current?.reset();
  }, [state]);
  return ref;
}

// パスワード・メールアドレスの両方のフォームに出るので、id はそれぞれ別にする
function CurrentPasswordField({ id }: { id: string }) {
  return (
    <AdminField label="今のパスワード" htmlFor={id}>
      <input
        id={id}
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        className={adminInput}
      />
    </AdminField>
  );
}

export function PasswordForm({ recovery }: { recovery: boolean }) {
  const [state, formAction, pending] = useActionState(changePassword, INITIAL);
  const ref = useClearOnDone(state);

  return (
    <form ref={ref} action={formAction} onSubmit={keepInputsOnSubmit(formAction)} className="space-y-5">
      <Result state={state} />
      {recovery ? <input type="hidden" name="recovery" value="1" /> : <CurrentPasswordField id="password-current" />}
      <AdminField
        label="新しいパスワード"
        htmlFor="newPassword"
        hint="12文字以上。英字の大文字・小文字・数字・記号を混ぜ、ほかのサービスと使い回さないものにしてください。"
      >
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className={adminInput}
        />
      </AdminField>
      <AdminField label="新しいパスワード（確認のため、もう一度）" htmlFor="confirmPassword">
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className={adminInput}
        />
      </AdminField>
      <SubmitButton pending={pending} pendingLabel="変更中...">
        パスワードを変更
      </SubmitButton>
    </form>
  );
}

export function EmailForm() {
  const [state, formAction, pending] = useActionState(changeEmail, INITIAL);
  const ref = useClearOnDone(state);

  return (
    <form ref={ref} action={formAction} onSubmit={keepInputsOnSubmit(formAction)} className="space-y-5">
      <Result state={state} />
      <AdminField label="新しいメールアドレス" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="email" required className={adminInput} />
      </AdminField>
      <CurrentPasswordField id="email-current" />
      <SubmitButton pending={pending} pendingLabel="送信中...">
        確認メールを送る
      </SubmitButton>
    </form>
  );
}
