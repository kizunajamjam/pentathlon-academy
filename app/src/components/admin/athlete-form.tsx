"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

import { saveAthlete, type AthleteFormState } from "@/app/admin/(dashboard)/athletes/actions";
import { AdminField, SubmitButton, adminInput } from "./form-ui";
import { DISCIPLINES } from "@/lib/constants/site";
import type { Athlete } from "@/types";

const INITIAL: AthleteFormState = {};

export function AthleteForm({ athlete }: { athlete?: Athlete }) {
  const [state, formAction] = useActionState(saveAthlete, INITIAL);

  return (
    <form action={formAction} className="space-y-6">
      {athlete && <input type="hidden" name="id" value={athlete.id} />}

      {state.message && (
        <p className="flex items-start gap-2.5 rounded-md border border-shoot-500/30 bg-shoot-50 px-4 py-3 text-sm text-shoot-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {state.message}
        </p>
      )}

      <AdminField label="氏名" htmlFor="name">
        <input id="name" name="name" defaultValue={athlete?.name} maxLength={100} className={adminInput} />
      </AdminField>

      <AdminField label="種目" htmlFor="discipline">
        <select
          id="discipline"
          name="discipline"
          defaultValue={athlete?.discipline ?? "swimming"}
          className={adminInput}
        >
          {DISCIPLINES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </AdminField>

      <AdminField label="指定" htmlFor="designation" hint="強化選手規定の種目とランク。例: 水泳S指定">
        <input
          id="designation"
          name="designation"
          defaultValue={athlete?.designation}
          maxLength={50}
          className={adminInput}
        />
      </AdminField>

      <AdminField
        label="記録"
        htmlFor="records"
        hint="「種目 | 記録」の形で1行ずつ。例: 50m 自由形（短水路） | 24秒64"
      >
        <textarea
          id="records"
          name="records"
          rows={5}
          defaultValue={athlete?.records.map((r) => `${r.event} | ${r.time}`).join("\n")}
          className={`resize-y ${adminInput}`}
        />
      </AdminField>

      <AdminField label="表示順" htmlFor="sortOrder" hint="小さい順に並びます。">
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={athlete?.sortOrder ?? 100}
          className={adminInput}
        />
      </AdminField>

      <label className="flex items-center gap-3 rounded-md border border-border bg-white px-4 py-3.5">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={athlete?.isPublished ?? true}
          className="h-4 w-4 accent-navy-800"
        />
        <span className="text-sm text-navy-800">サイトに公開する</span>
      </label>

      <SubmitButton>保存する</SubmitButton>
    </form>
  );
}
