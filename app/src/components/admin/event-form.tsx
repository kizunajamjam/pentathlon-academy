"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

import { saveEvent, type EventFormState } from "@/app/admin/(dashboard)/events/actions";
import { AdminField, SubmitButton, adminInput } from "./form-ui";
import { EVENT_CATEGORY_LABEL } from "@/lib/constants/site";
import type { AcademyEvent, EventCategory } from "@/types";

const INITIAL: EventFormState = {};

export function EventForm({
  event,
  defaultStartsAt,
  defaultEndsAt,
}: {
  event?: AcademyEvent;
  // ハイドレーション不一致を避けるため、初期日時はサーバー側で作って渡す。
  defaultStartsAt: string;
  defaultEndsAt: string;
}) {
  const [state, formAction] = useActionState(saveEvent, INITIAL);

  return (
    <form action={formAction} className="space-y-6">
      {event && <input type="hidden" name="id" value={event.id} />}

      {state.message && (
        <p className="flex items-start gap-2.5 rounded-md border border-shoot-500/30 bg-shoot-50 px-4 py-3 text-sm text-shoot-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {state.message}
        </p>
      )}

      <AdminField label="タイトル" htmlFor="title">
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={event?.title}
          maxLength={200}
          className={adminInput}
        />
      </AdminField>

      <AdminField label="種別" htmlFor="category">
        <select
          id="category"
          name="category"
          defaultValue={event?.category ?? "competition"}
          className={adminInput}
        >
          {(Object.keys(EVENT_CATEGORY_LABEL) as EventCategory[]).map((c) => (
            <option key={c} value={c}>
              {EVENT_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </AdminField>

      <div className="grid gap-6 sm:grid-cols-2">
        <AdminField label="開始日時" htmlFor="startsAt">
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={defaultStartsAt}
            className={adminInput}
          />
        </AdminField>

        <AdminField label="終了日時" htmlFor="endsAt" hint="未定の場合は空欄で構いません。">
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={defaultEndsAt}
            className={adminInput}
          />
        </AdminField>
      </div>

      <AdminField label="場所" htmlFor="location">
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={event?.location ?? ""}
          maxLength={200}
          className={adminInput}
        />
      </AdminField>

      <AdminField
        label="詳細ページのリンク"
        htmlFor="url"
        hint="協会サイトの要項ページなど。入力すると「大会の詳細・要項」ボタンが表示されます。"
      >
        <input
          id="url"
          name="url"
          type="url"
          inputMode="url"
          placeholder="https://pentathlon.jp/..."
          defaultValue={event?.url ?? ""}
          className={adminInput}
        />
      </AdminField>

      <AdminField label="説明" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={event?.description ?? ""}
          className={`resize-y ${adminInput}`}
        />
      </AdminField>

      <label className="flex items-center gap-3 rounded-md border border-border bg-white px-4 py-3.5">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={event?.isPublished ?? false}
          className="h-4 w-4 accent-navy-800"
        />
        <span className="text-sm text-navy-800">
          サイトに公開する
          <span className="ml-2 text-xs text-muted">
            （チェックを外すと下書きとして保存されます）
          </span>
        </span>
      </label>

      <div className="pt-2">
        <SubmitButton>保存する</SubmitButton>
      </div>
    </form>
  );
}
