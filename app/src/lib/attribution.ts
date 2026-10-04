// 流入元を sessionStorage に残すときのキー。書き込み側（Analytics）と読み出し側（問い合わせフォーム）で共有する。
export const ATTRIBUTION_KEY = "pa-attribution";

export type Attribution = { source: string; landingPath: string };

export function readAttribution(): Attribution {
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_KEY);
    if (raw) {
      const v = JSON.parse(raw) as Partial<Attribution>;
      return { source: v.source ?? "", landingPath: v.landingPath ?? "" };
    }
  } catch {
    // 読めなければ「不明」として扱う
  }
  return { source: "", landingPath: "" };
}

// Plausible のカスタムイベント。未導入のときは何もしない。
export function trackEvent(name: string, props?: Record<string, string>) {
  const plausible = (window as unknown as { plausible?: (n: string, o?: object) => void })
    .plausible;
  plausible?.(name, props ? { props } : undefined);
}
