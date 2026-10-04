"use client";

import { useEffect } from "react";
import Script from "next/script";

import { ATTRIBUTION_KEY } from "@/lib/attribution";

/*
 * アクセス解析（Plausible）と、流入元の記録。
 *
 * Plausible は Cookie を使わないので同意バナーが要らない。
 * NEXT_PUBLIC_PLAUSIBLE_DOMAIN が未設定、または確認用プレビューでは何も読み込まない。
 *
 * 流入元は、この訪問で最初に開いたページの情報を sessionStorage に残す。
 * お問い合わせの送信時にこれを添えて、問い合わせごとの流入元を集計できるようにする。
 */
const DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const ENABLED = Boolean(DOMAIN) && process.env.NEXT_PUBLIC_IS_PREVIEW !== "1";

export function Analytics() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(ATTRIBUTION_KEY)) return;

      const params = new URLSearchParams(window.location.search);
      let source = params.get("utm_source");
      if (!source && document.referrer) {
        const host = new URL(document.referrer).hostname;
        // 自サイト内の移動は流入元として数えない
        if (host !== window.location.hostname) source = host;
      }

      sessionStorage.setItem(
        ATTRIBUTION_KEY,
        JSON.stringify({ source: source ?? "", landingPath: window.location.pathname }),
      );
    } catch {
      // 記録できなくても、サイトの表示や問い合わせの送信には影響させない
    }
  }, []);

  if (!ENABLED) return null;

  return (
    <Script
      defer
      data-domain={DOMAIN}
      src="https://plausible.io/js/script.tagged-events.js"
      strategy="afterInteractive"
    />
  );
}
