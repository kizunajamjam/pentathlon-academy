// セクション見出し。英字ラベル(ロゴの "ACADEMY" と同じ字間)＋日本語見出しの2段組み。
export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "dark",
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "dark" | "light";
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p className={`eyebrow text-xs ${tone === "light" ? "text-gold-400" : "text-gold-600"}`}>
        {eyebrow}
      </p>
      {/*
        見出しは15文字前後のものが多く、24px 固定だと幅の狭いスマホで
        最後の1〜2文字だけが次の行に落ちる。clamp で画面幅に追従させると
        最長15文字の見出しでも360px級で1行に収まり、400px 以上では従来どおり 24px になる。
      */}
      <h2
        className={`mt-3 text-[clamp(1.125rem,5.6vw,1.5rem)] sm:text-3xl ${
          tone === "light" ? "text-white" : "text-navy-800"
        }`}
      >
        {title}
      </h2>
      <span
        className={`mt-4 block h-0.5 w-12 bg-gold-500 ${align === "center" ? "mx-auto" : ""}`}
      />
      {description && (
        <p
          className={`mt-5 max-w-2xl text-sm leading-relaxed sm:text-base ${
            align === "center" ? "mx-auto" : ""
          } ${tone === "light" ? "text-navy-200" : "text-muted"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
