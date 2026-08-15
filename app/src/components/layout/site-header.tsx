"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { NAV_ITEMS } from "@/lib/constants/site";
import { SiteLogo } from "./site-logo";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 「/」だけは完全一致。それ以外は詳細ページ(/news/xxx)でも親を点灯させる。
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-navy-800 shadow-sm">
      {/*
        ヘッダーだけ各ページの本文セクションより広いコンテナを使う。
        max-w-6xl（本文と同じ幅）だと、ロゴ＋7項目＋CTAボタンの合計幅が
        コンテナ幅を超え、各リンクが個別に縮んで日本語が途中で折り返されていた。
        ページ幅を広げても直らなかったのは、コンテナ自体に上限があったため。
      */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:h-20">
        <Link href="/" onClick={() => setOpen(false)}>
          <SiteLogo />
        </Link>

        {/* デスクトップ: 7項目あるので xl 以上でのみ横並びにする */}
        <nav className="hidden xl:flex xl:items-center xl:gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded px-2.5 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? "text-gold-400"
                  : "text-navy-100 hover:bg-navy-700 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="ml-3 whitespace-nowrap rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-900 transition-colors hover:bg-gold-400"
          >
            体験のお申し込み
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded p-2 text-white hover:bg-navy-700 xl:hidden"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* モバイル */}
      {open && (
        <nav className="border-t border-navy-700 bg-navy-800 xl:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-baseline gap-3 border-b border-navy-700/60 py-3.5 ${
                    isActive(item.href) ? "text-gold-400" : "text-white"
                  }`}
                >
                  <span className="eyebrow w-24 shrink-0 text-[10px] text-navy-300">
                    {item.labelEn}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 pb-5 pt-2">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-gold-500 px-5 py-3 text-center text-sm font-bold text-navy-900"
            >
              体験のお申し込み
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
