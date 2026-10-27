"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { AlertCircle } from "lucide-react";

import { saveNews, type NewsFormState } from "@/app/admin/(dashboard)/news/actions";
import { AdminField, SubmitButton, adminInput } from "./form-ui";
import { keepInputsOnSubmit } from "@/lib/form-submit";
import { NEWS_CATEGORY_LABEL } from "@/lib/constants/site";
import { IMAGE_TYPES } from "@/lib/news-image-limits";
import { shrinkImageIfNeeded } from "@/lib/shrink-image";
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
  const [state, formAction, pending] = useActionState(saveNews, INITIAL);
  const [imageNote, setImageNote] = useState<{ text: string; isError: boolean } | null>(null);
  const [shrinking, setShrinking] = useState(false);

  // 選んだ時点で大きさを確かめ、上限を超えていれば縮小した画像に差し替える
  const onImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    setImageNote(null);
    if (!file) return;

    setShrinking(true);
    const fitted = await shrinkImageIfNeeded(file);
    setShrinking(false);

    if (!fitted) {
      input.value = "";
      setImageNote({
        text: "画像が大きすぎるため選べませんでした。4MB 以下の画像を選んでください。",
        isError: true,
      });
      return;
    }
    if (fitted !== file) {
      const files = new DataTransfer();
      files.items.add(fitted);
      input.files = files.files;
      setImageNote({ text: "画像が 4MB を超えていたので、小さくして使います。", isError: false });
    }
  };

  return (
    <form action={formAction} onSubmit={keepInputsOnSubmit(formAction)} className="space-y-6">
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

      <AdminField label="本文" htmlFor="body" hint="空行で段落が分かれます。1回の改行は、段落の中の改行になります。">
        <textarea
          id="body"
          name="body"
          rows={12}
          defaultValue={news?.body}
          className={`resize-y ${adminInput}`}
        />
      </AdminField>

      <AdminField
        label="画像"
        htmlFor="image"
        hint="JPEG・PNG・WebP。4MB を超える写真は自動で小さくします。お知らせの冒頭に表示されます。"
      >
        {news?.imageUrl && (
          <div className="mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- Storage の公開URLをそのまま表示する */}
            <img
              src={news.imageUrl}
              alt=""
              className="max-h-48 rounded-md border border-border object-contain"
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" name="removeImage" className="h-5 w-5 shrink-0 accent-navy-800" />
              この画像を外す
            </label>
          </div>
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept={IMAGE_TYPES.join(",")}
          onChange={onImageChange}
          className="block w-full text-base text-navy-700 file:mr-4 file:min-h-11 file:rounded-full file:border-0 file:bg-navy-50 file:px-5 file:text-base file:text-navy-800 sm:text-sm sm:file:text-sm"
        />
        {shrinking && <p className="mt-2 text-xs text-muted">画像を確認しています...</p>}
        {imageNote && (
          <p className={`mt-2 text-xs ${imageNote.isError ? "text-shoot-700" : "text-muted"}`}>
            {imageNote.text}
          </p>
        )}
      </AdminField>

      <label className="flex items-center gap-3 rounded-md border border-border bg-white px-4 py-3.5">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={news?.isPublished ?? false}
          className="h-5 w-5 shrink-0 accent-navy-800"
        />
        <span className="text-sm text-navy-800">
          サイトに公開する
          <span className="ml-2 text-xs text-muted">
            （チェックを外すと下書きとして保存されます）
          </span>
        </span>
      </label>

      <div className="flex gap-3 pt-2">
        <SubmitButton pending={pending || shrinking}>保存する</SubmitButton>
      </div>
    </form>
  );
}
