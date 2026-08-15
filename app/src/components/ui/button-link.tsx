import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STYLES = {
  primary: "bg-gold-500 text-navy-900 hover:bg-gold-400",
  outline: "border border-navy-200 text-navy-800 hover:border-gold-500 hover:text-gold-600",
  ghost: "border border-white/30 text-white hover:border-gold-400 hover:text-gold-400",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof STYLES;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors ${STYLES[variant]} ${className}`}
    >
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}
