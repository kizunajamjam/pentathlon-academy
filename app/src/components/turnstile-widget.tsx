"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

/*
 * Cloudflare Turnstile（bot 対策）。
 *
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY が未設定なら何も出さない（ハニーポットだけで運用）。
 * ウィジェットは form 内に cf-turnstile-response という hidden 入力を足し、
 * Server Action 側（TURNSTILE_SECRET_KEY）で検証する。
 *
 * 描画は自分で行う（render=explicit）。自動描画に任せると、スクリプトを読み込んだ
 * 最初の1回しか描かれず、サイト内リンクでお問い合わせページに戻ってきたときに
 * ウィジェットが出ないまま、送信が必ず失敗していた。
 *
 * トークンは1回しか使えないので、送信結果が返るたび（resetKey が変わるたび）に作り直す。
 */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileApi = {
  render: (el: HTMLElement, options: { sitekey: string; language?: string }) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

function getTurnstile(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile;
}

export function TurnstileWidget({ resetKey }: { resetKey: unknown }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // スクリプトが使える状態か。2回目以降の表示では読み込み済みなので onReady がすぐ呼ばれる
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const turnstile = getTurnstile();
    if (!ready || !SITE_KEY || !turnstile || !container.current) return;

    widgetId.current = turnstile.render(container.current, { sitekey: SITE_KEY, language: "ja" });
    return () => {
      if (widgetId.current) turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [ready]);

  // 送信結果が返ったとき（初回の表示は除く）だけ作り直す
  const lastResetKey = useRef(resetKey);
  useEffect(() => {
    if (lastResetKey.current === resetKey) return;
    lastResetKey.current = resetKey;
    if (widgetId.current) getTurnstile()?.reset(widgetId.current);
  }, [resetKey]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={container} />
    </>
  );
}
