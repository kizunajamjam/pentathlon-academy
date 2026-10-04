"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

import { saveCoach, type CoachFormState } from "@/app/admin/(dashboard)/coaches/actions";
import { AdminField, SubmitButton, adminInput } from "./form-ui";
import type { Coach } from "@/types";

const INITIAL: CoachFormState = {};

export function CoachForm({ coach }: { coach?: Coach }) {
  const [state, formAction] = useActionState(saveCoach, INITIAL);

  return (
    <form action={formAction} className="space-y-6">
      {coach && <input type="hidden" name="id" value={coach.id} />}

      {state.message && (
        <p className="flex items-start gap-2.5 rounded-md border border-shoot-500/30 bg-shoot-50 px-4 py-3 text-sm text-shoot-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {state.message}
        </p>
      )}

      <AdminField label="氏名" htmlFor="name">
        <input id="name" name="name" defaultValue={coach?.name} maxLength={100} className={adminInput} />
      </AdminField>

      <AdminField label="肩書き" htmlFor="title" hint="カードのバッジに表示されます。例: 近代五種コーチ">
        <input id="title" name="title" defaultValue={coach?.title} maxLength={100} className={adminInput} />
      </AdminField>

      <AdminField label="経歴・実績" htmlFor="bio" hint="1行が1項目になります。">
        <textarea
          id="bio"
          name="bio"
          rows={8}
          defaultValue={coach?.bio.join("\n")}
          className={`resize-y ${adminInput}`}
        />
      </AdminField>

      <AdminField label="表示順" htmlFor="sortOrder" hint="小さい順に並びます。">
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={coach?.sortOrder ?? 100}
          className={adminInput}
        />
      </AdminField>

      <label className="flex items-center gap-3 rounded-md border border-border bg-white px-4 py-3.5">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={coach?.isPublished ?? true}
          className="h-4 w-4 accent-navy-800"
        />
        <span className="text-sm text-navy-800">サイトに公開する</span>
      </label>

      <SubmitButton>保存する</SubmitButton>
    </form>
  );
}
