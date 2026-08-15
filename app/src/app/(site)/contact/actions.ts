"use server";

import { createInquiry } from "@/lib/db/inquiries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { INQUIRY_CATEGORIES, SITE } from "@/lib/constants/site";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "category" | "message", string>>;
};

const MAX = { name: 100, email: 254, phone: 30, message: 2000 };

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function submitInquiry(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // ハニーポット。通常のブラウザでは非表示なので、値が入っていれば bot とみなす。
  // 何も知らせずに成功扱いにして、送信を黙って捨てる。
  if (str(formData, "website") !== "") {
    return { status: "success" };
  }

  const name = str(formData, "name");
  const email = str(formData, "email");
  const phone = str(formData, "phone");
  const category = str(formData, "category");
  const message = str(formData, "message");

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "お名前を入力してください。";
  else if (name.length > MAX.name) fieldErrors.name = "お名前が長すぎます。";

  if (!email) fieldErrors.email = "メールアドレスを入力してください。";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > MAX.email)
    fieldErrors.email = "メールアドレスの形式をご確認ください。";

  if (!category || !INQUIRY_CATEGORIES.includes(category as (typeof INQUIRY_CATEGORIES)[number]))
    fieldErrors.category = "お問い合わせ種別を選択してください。";

  if (!message) fieldErrors.message = "お問い合わせ内容を入力してください。";
  else if (message.length > MAX.message) fieldErrors.message = "内容が長すぎます（2000字以内）。";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "入力内容をご確認ください。", fieldErrors };
  }

  // Supabase 未接続のうちは保存できないため、正直に電話・メールへ誘導する。
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message: `現在フォームからの送信を準備中です。お手数ですが ${SITE.tel} または ${SITE.email} までご連絡ください。`,
    };
  }

  const { error } = await createInquiry({
    name,
    email,
    phone: phone.slice(0, MAX.phone) || null,
    category,
    message,
  });

  if (error) {
    console.error("[contact] 保存に失敗しました", error);
    return {
      status: "error",
      message: "送信に失敗しました。時間をおいて再度お試しください。",
    };
  }

  // 保存が成功していれば管理画面から確認できるので、
  // 通知メールが送れなくても送信自体は成功として扱う。
  await notifyByEmail({ name, email, phone, category, message });

  return { status: "success" };
}

/*
 * 問い合わせ受信の通知メール。
 *
 * RESEND_API_KEY と CONTACT_NOTIFY_TO が設定されているときだけ送る。
 * SDK は入れず REST API を直接叩いている(依存を増やさないため)。
 * 失敗してもユーザーへの応答は変えない ＝ DB 保存が正、メールは補助。
 */
async function notifyByEmail(input: {
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_TO;
  const from = process.env.CONTACT_NOTIFY_FROM;

  if (!apiKey || !to || !from) return;

  const body = [
    `種別: ${input.category}`,
    `お名前: ${input.name}`,
    `メール: ${input.email}`,
    `電話: ${input.phone || "(未入力)"}`,
    "",
    input.message,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: `【${SITE.name}】お問い合わせ: ${input.category}`,
        text: body,
      }),
    });

    if (!res.ok) {
      console.error("[contact] 通知メールの送信に失敗", res.status, await res.text());
    }
  } catch (e) {
    console.error("[contact] 通知メールの送信に失敗", e);
  }
}
