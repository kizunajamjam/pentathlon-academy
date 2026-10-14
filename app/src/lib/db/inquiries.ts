import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { unwrap } from "./unwrap";
import type { Inquiry } from "@/types";

type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  category: string;
  message: string;
  is_handled: boolean;
  created_at: string;
  source: string | null;
  landing_path: string | null;
  handled_at: string | null;
};

function mapInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    category: row.category,
    message: row.message,
    isHandled: row.is_handled,
    createdAt: row.created_at,
    source: row.source,
    landingPath: row.landing_path,
    handledAt: row.handled_at,
  };
}

export type InquiryInput = {
  name: string;
  email: string;
  phone: string | null;
  category: string;
  message: string;
  source: string | null;
  landingPath: string | null;
};

// 投稿は匿名(anon)から行われる。RLS で insert のみ許可している。
export async function createInquiry(input: InquiryInput) {
  // service_role キーがあればそれで保存する（匿名の insert 権限を閉じられる）。
  // 無ければ従来どおり匿名のまま保存する。
  const supabase = createServiceClient() ?? (await createClient());
  const { error } = await supabase.from("inquiries").insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
    category: input.category,
    message: input.message,
    source: input.source,
    landing_path: input.landingPath,
  });

  // insert 後に select すると SELECT ポリシーも評価されて anon では弾かれるため、
  // 戻り値は受け取らない（.select() を付けないこと）。
  return { error };
}

/*
 * 直近 minutes 分に届いた問い合わせの件数（全体と、同じメールアドレスからの分）。
 * 連続送信の制限に使う。
 *
 * 匿名(anon)は select できないので、service_role キーがあるときだけ数えられる。
 * キーが無い・数えられなかったときは null を返し、呼び出し側は制限をかけない
 * （数えられないことを理由に、正規の問い合わせを落とさないため）。
 */
// ilike で大文字小文字だけを無視して完全一致させる（% と _ をワイルドカードにしない）
const escapeLike = (v: string) => v.replace(/[\\%_]/g, "\\$&");

export async function countRecentInquiries(
  email: string,
  minutes: number,
): Promise<{ total: number; sameEmail: number } | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const recent = () =>
    supabase.from("inquiries").select("id", { count: "exact", head: true }).gte("created_at", since);

  const [total, sameEmail] = await Promise.all([recent(), recent().ilike("email", escapeLike(email))]);
  if (total.error || sameEmail.error) {
    console.error("[db/inquiries] 直近の件数を数えられませんでした", total.error ?? sameEmail.error);
    return null;
  }
  return { total: total.count ?? 0, sameEmail: sameEmail.count ?? 0 };
}

// 管理画面用。
export async function listInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const data = unwrap("inquiries", await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false }));

  return (data ?? []).map(mapInquiry);
}

export async function setInquiryHandled(id: string, isHandled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").update({ is_handled: isHandled }).eq("id", id);
  return { error };
}
