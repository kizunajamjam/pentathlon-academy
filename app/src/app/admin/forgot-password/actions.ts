"use server";

import { authCallbackUrl } from "@/lib/auth-links";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type ForgotState = { message?: string; sent?: boolean };

// パスワード再設定のメールを送る
export async function requestPasswordReset(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
  if (!isSupabaseConfigured) {
    return { message: "Supabase が未設定です。.env.local を設定してください。" };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { message: "メールアドレスを入力してください。" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await authCallbackUrl("reset"),
  });

  if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
    return { message: "送信が続いたため、いったん止めています。しばらく時間をおいてから、もう一度お試しください。" };
  }

  // 登録の有無にかかわらず同じ結果を返す（アカウントの存在有無を推測されないようにするため）
  return { sent: true };
}
