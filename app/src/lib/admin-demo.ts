import "server-only";

import { cookies } from "next/headers";

import { DEMO_ACCOUNT, isAdminDemo } from "@/lib/supabase/config";

/*
 * 管理画面のデモ版のログイン状態（lib/supabase/config.ts の isAdminDemo を参照）。
 *
 * デモ版は仮データしか持たず、保存もしないので、ログインは「デモのアカウントで入った」
 * 印の Cookie だけで管理する。Cookie を手で作れば入れてしまうが、見えるのは仮データだけ。
 */
const COOKIE = "pa-admin-demo";

export const DEMO_READ_ONLY_MESSAGE = "デモ版のため、保存・削除はできません（画面の確認用です）。";

export function isDemoAccount(email: string, password: string) {
  return isAdminDemo && email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password;
}

export async function startDemoSession() {
  (await cookies()).set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
  });
}

export async function endDemoSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function hasDemoSession() {
  return isAdminDemo && (await cookies()).get(COOKIE)?.value === "1";
}
