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
      <h2
        className={`mt-3 text-2xl sm:text-3xl ${
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
