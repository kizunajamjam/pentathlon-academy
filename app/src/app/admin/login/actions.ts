"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isAdminDemo, isSupabaseConfigured } from "@/lib/supabase/config";
import { endDemoSession, isDemoAccount, startDemoSession } from "@/lib/admin-demo";

export type LoginState = { message?: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  // デモ版: 仮のアカウントで、二段階認証なしにそのまま入る（lib/admin-demo.ts）
  if (isAdminDemo) {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!isDemoAccount(email, password)) {
      return { message: "メールアドレスまたはパスワードが正しくありません。" };
    }
    await startDemoSession();
    redirect("/admin");
  }

  if (!isSupabaseConfigured) {
    return { message: "Supabase が未設定です。.env.local を設定してください。" };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "メールアドレスとパスワードを入力してください。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // 「メールアドレスが存在しない」と「パスワードが違う」を区別して返さない
    // (アカウントの存在有無を推測されないようにするため)。
    return { message: "メールアドレスまたはパスワードが正しくありません。" };
  }

  // 続けて二段階認証（認証アプリのコード）へ。未登録ならそこで登録する
  redirect("/admin/mfa");
}

export async function signOut() {
  if (isAdminDemo) {
    await endDemoSession();
    redirect("/admin/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
