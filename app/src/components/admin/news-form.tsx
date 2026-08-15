"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

import { saveNews, type NewsFormState } from "@/app/admin/(dashboard)/news/actions";
import { AdminField, SubmitButton, adminInput } from "./form-ui";
import { NEWS_CATEGORY_LABEL } from "@/lib/constants/site";
import type { News, NewsCategory } from "@/types";

const INITIAL: NewsFormState = {};

export function NewsForm({
  news,
  defaultPublishedAt,
}: {
  news?: News;
  // 新規作成時の初期値。現在時刻の JST 文字列をサーバー側で作って渡す
  // (クライアントで生成するとハイドレーション不一致になるため)。
  defaultPublishedAt: string;
}) {
  const [state, formAction] = useActionState(saveNews, INITIAL);

  return (
    <form action={formAction} className="space-y-6">
      {news && <input type="hidden" name="id" value={news.id} />}

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
          defaultValue={news?.title}
          maxLength={200}
          className={adminInput}
        />
      </AdminField>

      <AdminField label="種別" htmlFor="category">
        <select
          id="category"
          name="category"
          defaultValue={news?.category ?? "notice"}
          className={adminInput}
        >
          {(Object.keys(NEWS_CATEGORY_LABEL) as NewsCategory[]).map((c) => (
            <option key={c} value={c}>
              {NEWS_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </AdminField>

      <AdminField
        label="公開日時"
        htmlFor="publishedAt"
        hint="未来の日時を指定すると、その時刻になるまでサイトには表示されません。"
      >
        <input
          id="publishedAt"
          name="publishedAt"
          type="datetime-local"
          defaultValue={defaultPublishedAt}
          className={adminInput}
        />
      </AdminField>

      <AdminField label="本文" htmlFor="body" hint="改行がそのまま段落になります。">
        <textarea
          id="body"
          name="body"
          rows={12}
          defaultValue={news?.body}
          className={`resize-y ${adminInput}`}
        />
      </AdminField>

      <label className="flex items-center gap-3 rounded-md border border-border bg-white px-4 py-3.5">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={news?.isPublished ?? false}
          className="h-4 w-4 accent-navy-800"
        />
        <span className="text-sm text-navy-800">
          サイトに公開する
          <span className="ml-2 text-xs text-muted">
            （チェックを外すと下書きとして保存されます）
          </span>
        </span>
      </label>

      <div className="flex gap-3 pt-2">
        <SubmitButton>保存する</SubmitButton>
      </div>
    </form>
  );
}
