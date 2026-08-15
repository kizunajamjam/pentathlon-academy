"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

import { saveSlot, type SlotFormState } from "@/app/admin/(dashboard)/schedule/actions";
import { AdminField, SubmitButton, adminInput } from "./form-ui";
import { DAY_LABEL, DISCIPLINES } from "@/lib/constants/site";
import type { ScheduleSlot } from "@/types";

const INITIAL: SlotFormState = {};

// 月曜はじまりで並べる
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function SlotForm({ slot }: { slot?: ScheduleSlot }) {
  const [state, formAction] = useActionState(saveSlot, INITIAL);

  return (
    <form action={formAction} className="space-y-6">
      {slot && <input type="hidden" name="id" value={slot.id} />}

      {state.message && (
        <p className="flex items-start gap-2.5 rounded-md border border-shoot-500/30 bg-shoot-50 px-4 py-3 text-sm text-shoot-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {state.message}
        </p>
      )}

      <AdminField label="曜日" htmlFor="dayOfWeek">
        <select
          id="dayOfWeek"
          name="dayOfWeek"
          defaultValue={slot?.dayOfWeek ?? 1}
          className={adminInput}
        >
          {DAY_ORDER.map((d) => (
            <option key={d} value={d}>
              {DAY_LABEL[d]}曜日
            </option>
          ))}
        </select>
      </AdminField>

      <div className="grid gap-6 sm:grid-cols-2">
        <AdminField label="開始時刻" htmlFor="startTime">
          <input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={slot?.startTime ?? "17:30"}
            className={adminInput}
          />
        </AdminField>

        <AdminField label="終了時刻" htmlFor="endTime">
          <input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue={slot?.endTime ?? "19:00"}
            className={adminInput}
          />
        </AdminField>
      </div>

      <AdminField label="クラス名" htmlFor="className" hint="例: 初級クラス / 選手クラス / 一般クラス">
        <input
          id="className"
          name="className"
          type="text"
          defaultValue={slot?.className}
          maxLength={100}
          className={adminInput}
        />
      </AdminField>

      <AdminField label="種目" htmlFor="discipline" hint="複数種目を行う日は「指定なし」を選んでください。">
        <select
          id="discipline"
          name="discipline"
          defaultValue={slot?.discipline ?? ""}
          className={adminInput}
        >
          <option value="">指定なし</option>
          {DISCIPLINES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </AdminField>

      <AdminField label="場所" htmlFor="location">
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={slot?.location ?? ""}
          maxLength={200}
          className={adminInput}
        />
      </AdminField>

      <AdminField label="備考" htmlFor="note" hint="例: 雨天時は室内練習 / 月2回">
        <input
          id="note"
          name="note"
          type="text"
          defaultValue={slot?.note ?? ""}
          maxLength={200}
          className={adminInput}
        />
      </AdminField>

      <AdminField
        label="並び順"
        htmlFor="sortOrder"
        hint="同じ曜日に複数の枠があるとき、数字が小さいものが上に表示されます。"
      >
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={slot?.sortOrder ?? 0}
          className={adminInput}
        />
      </AdminField>

      <label className="flex items-center gap-3 rounded-md border border-border bg-white px-4 py-3.5">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={slot?.isActive ?? true}
          className="h-4 w-4 accent-navy-800"
        />
        <span className="text-sm text-navy-800">
          サイトに表示する
          <span className="ml-2 text-xs text-muted">
            （休止中の枠はチェックを外してください）
          </span>
        </span>
      </label>

      <div className="pt-2">
        <SubmitButton>保存する</SubmitButton>
      </div>
    </form>
  );
}
