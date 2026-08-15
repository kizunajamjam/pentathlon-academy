import "server-only";

import { createClient } from "@/lib/supabase/server";
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
  };
}

export type InquiryInput = {
  name: string;
  email: string;
  phone: string | null;
  category: string;
  message: string;
};

// 投稿は匿名(anon)から行われる。RLS で insert のみ許可している。
export async function createInquiry(input: InquiryInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
    category: input.category,
    message: input.message,
  });

  // insert 後に select すると SELECT ポリシーも評価されて anon では弾かれるため、
  // 戻り値は受け取らない（.select() を付けないこと）。
  return { error };
}

// 管理画面用。
export async function listInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapInquiry);
}

export async function setInquiryHandled(id: string, isHandled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").update({ is_handled: isHandled }).eq("id", id);
  return { error };
}
