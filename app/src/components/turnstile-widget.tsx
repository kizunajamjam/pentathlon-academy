"use client";

import { useEffect } from "react";
import Script from "next/script";

/*
 * Cloudflare Turnstile（bot 対策）。
 *
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY が未設定なら何も出さない（ハニーポットだけで運用）。
 * ウィジェットは form 内に cf-turnstile-response という hidden 入力を足し、
 * Server Action 側（TURNSTILE_SECRET_KEY）で検証する。
 *
 * トークンは1回しか使えないので、送信結果が返るたび（resetKey が変わるたび）に作り直す。
 */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileApi = { reset: () => void };

export function TurnstileWidget({ resetKey }: { resetKey: unknown }) {
  useEffect(() => {
    (window as unknown as { turnstile?: TurnstileApi }).turnstile?.reset();
  }, [resetKey]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div className="cf-turnstile" data-sitekey={SITE_KEY} data-language="ja" />
    </>
  );
}
