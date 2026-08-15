import { PentagonMotif } from "@/components/layout/site-logo";

// 下層ページ共通の見出し帯。背景にロゴの五角形を薄く重ねている。
export function PageHero({ title, titleEn }: { title: string; titleEn: string }) {
  return (
    <div className="relative overflow-hidden bg-navy-800">
      <PentagonMotif className="pointer-events-none absolute -right-8 -top-10 h-56 w-56 opacity-10 sm:right-8" />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <p className="eyebrow text-xs text-gold-400">{titleEn}</p>
        <h1 className="mt-3 text-3xl text-white sm:text-4xl">{title}</h1>
        <span className="mt-5 block h-0.5 w-12 bg-gold-500" />
      </div>
    </div>
  );
}
