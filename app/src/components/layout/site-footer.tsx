import Link from "next/link";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";

import { NAV_ITEMS, SITE } from "@/lib/constants/site";
import { SiteLogo } from "./site-logo";

export function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-navy-200">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <SiteLogo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-300">
              {SITE.description}
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold-500" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-gold-500" />
                <span>{SITE.tel}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-gold-500" />
                <span>{SITE.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <AtSign size={16} className="mt-0.5 shrink-0 text-gold-500" />
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all transition-colors hover:text-gold-400"
                >
                  {SITE.instagramHandle}
                </a>
              </li>
            </ul>
          </div>

          <nav className="md:justify-self-end">
            <p className="eyebrow text-xs text-gold-500">MENU</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-gold-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-navy-700 pt-6 text-xs text-navy-400">
          <p>
            © {new Date().getFullYear()} {SITE.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
