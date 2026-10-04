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
