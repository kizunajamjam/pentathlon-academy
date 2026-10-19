"use client";

import { useActionState, useEffect, useRef, type FormEvent } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { AdminField, SubmitButton, adminInput } from "@/components/admin/form-ui";
import { ROLE_LABELS, type StaffRole } from "@/lib/staff-roles";
import { keepInputsOnSubmit } from "@/lib/form-submit";
import { changeRole, inviteStaff, removeStaff, resendInvite, type StaffActionState } from "./actions";

const INITIAL: StaffActionState = {};

function Result({ state }: { state: StaffActionState }) {
  if (state.message) {
    return (
      <p className="flex items-start gap-2 rounded-md border border-shoot-500/30 bg-shoot-50 px-3.5 py-2.5 text-sm leading-relaxed text-shoot-700">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        {state.message}
      </p>
    );
  }
  if (state.done) {
    return (
      <p className="flex items-start gap-2 rounded-md border border-success-500/30 bg-success-50 px-3.5 py-2.5 text-sm leading-relaxed text-success-500">
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
        {state.done}
      </p>
    );
  }
  return null;
}

function RoleSelect({ id, defaultValue }: { id: string; defaultValue: StaffRole }) {
  return (
    <select id={id} name="role" defaultValue={defaultValue} className={adminInput}>
      <option value="editor">{ROLE_LABELS.editor}（内容の編集だけ）</option>
      <option value="admin">{ROLE_LABELS.admin}（スタッフの管理もできる）</option>
    </select>
  );
}

export function InviteForm({ disabled }: { disabled: boolean }) {
  const [state, formAction, pending] = useActionState(inviteStaff, INITIAL);
  const ref = useRef<HTMLFormElement>(null);
  // 招待できたら空に戻す（続けて別の人を招待しやすいように）
  useEffect(() => {
    if (state.done) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} onSubmit={keepInputsOnSubmit(formAction)} className="space-y-5">
      <Result state={state} />
      <AdminField label="名前" htmlFor="invite-name" hint="管理画面の右上に表示されます。">
        <input id="invite-name" name="name" required className={adminInput} />
      </AdminField>
      <AdminField label="メールアドレス" htmlFor="invite-email">
        <input id="invite-email" name="email" type="email" autoComplete="off" required className={adminInput} />
      </AdminField>
      <AdminField label="ロール" htmlFor="invite-role">
        <RoleSelect id="invite-role" defaultValue="editor" />
      </AdminField>
      <fieldset disabled={disabled}>
        <SubmitButton pending={pending} pendingLabel="送信中...">
          招待メールを送る
        </SubmitButton>
      </fieldset>
    </form>
  );
}

export function RoleForm({ userId, role }: { userId: string; role: StaffRole }) {
  const [state, formAction, pending] = useActionState(changeRole, INITIAL);
  return (
    <form action={formAction} onSubmit={keepInputsOnSubmit(formAction)} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor={`role-${userId}`} className="sr-only">
          ロール
        </label>
        <div className="sm:w-72">
          <RoleSelect id={`role-${userId}`} defaultValue={role} />
        </div>
        <SubmitButton pending={pending} pendingLabel="変更中...">
          ロールを変更
        </SubmitButton>
      </div>
      <Result state={state} />
    </form>
  );
}

export function ResendInviteForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(resendInvite, INITIAL);
  return (
    <form action={formAction} onSubmit={keepInputsOnSubmit(formAction)} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <SubmitButton pending={pending} pendingLabel="送信中...">
        招待メールを再送
      </SubmitButton>
      <Result state={state} />
    </form>
  );
}

export function RemoveForm({ userId, name }: { userId: string; name: string }) {
  const [state, formAction, pending] = useActionState(removeStaff, INITIAL);
  const send = keepInputsOnSubmit(formAction);
  // 元に戻せないので、押し間違いに備えて一度確かめる
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (!window.confirm(`${name} さんを削除します。アカウントごと消え、元に戻せません。よろしいですか？`)) {
      e.preventDefault();
      return;
    }
    send(e);
  };

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <SubmitButton variant="danger" pending={pending} pendingLabel="削除中...">
        削除する
      </SubmitButton>
      <Result state={state} />
    </form>
  );
}
