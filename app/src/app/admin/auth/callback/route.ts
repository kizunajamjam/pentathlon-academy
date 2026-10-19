import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/*
 * メールのリンクの戻り先（パスワード再設定・メールアドレス変更の確認・スタッフの招待）。
 *
 * リンクを確認できたらログインした状態になるが、二段階認証はまだなので、
 * 認証アプリのコードを入れて（招待なら登録して）からアカウント設定へ進ませる。
 * 招待のリンクは Supabase のメール文面で token_hash と type=invite を付けて送る（docs/SETUP.md）。
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const flow = type === "invite" ? "invite" : params.get("flow") === "email" ? "email" : "reset";
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (!isSupabaseConfigured) return to("/admin/login");

  // メールアドレス変更で、新旧両方のアドレスに確認メールが届く設定のとき、
  // 1通目のリンクではまだ変更されず、Supabase から案内の message だけが届く
  if (!code && !tokenHash && params.get("message")) return to("/admin/login?link=email-partial");

  const supabase = await createClient();
  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  }

  if (!ok) {
    // メールアドレス変更は、リンクを開いた時点で Supabase 側の変更は済んでいる。
    // 申し込んだのと別のブラウザで開くとログインだけができないので、その案内を出す
    const link = { email: "email", invite: "invite-invalid", reset: "invalid" }[flow];
    return to(`/admin/login?link=${link}`);
  }

  return to("/admin/mfa?next=/admin/account");
}
