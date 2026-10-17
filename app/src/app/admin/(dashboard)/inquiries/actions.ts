"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffForAction } from "@/lib/auth-guard";
import { setInquiryHandled } from "@/lib/db/inquiries";

export async function toggleHandled(formData: FormData) {
  const staff = await getStaffForAction();
  if (!staff) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  if (!id) return;

  const { error } = await setInquiryHandled(id, next);
  if (error) console.error("[admin/inquiries] 更新に失敗", error);

  revalidatePath("/admin/inquiries");
}
