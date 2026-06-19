import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { FOOTER_NAV } from "@/lib/navigation";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";
import { navLabel, footerColumnLabel, localePath } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n.server";
import { Mail, Phone, ShieldCheck, Smartphone, Headset } from "lucide-react";

const REASSURANCE_ICONS = [ShieldCheck, Smartphone, Headset];

export async function PublicFooter() {
  const { locale, dict } = await getI18n();

  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="container-page py-14">
        {/* Reassurance */}
        <div className="grid grid-cols-1 gap-4 border-b border-border pb-10 sm:grid-cols-3">
          {dict.footer.reassurance.map((item, i) => {
            const ItemIcon = REASSURANCE_ICONS[i] ?? ShieldCheck;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <ItemIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-6">
          <div className="col-span-2">
            <Logo href={null} />
            <p className="mt-4 max-w-xs text-sm text-muted">{dict.footer.tagline}</p>
            <div className="mt-5 space-y-2 text-sm">
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 text-muted hover:text-foreground">
                <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
              </a>
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="flex items-center gap-2 text-muted hover:text-foreground">
                <Phone className="h-4 w-4" /> {CONTACT_PHONE}
              </a>
            </div>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-foreground">{footerColumnLabel(dict, col.title)}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={localePath(link.href, locale)}
                      className="text-sm text-muted transition-colors hover:text-brand-600"
                    >
                      {navLabel(dict, link.href, link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-7 text-sm text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} KoraStay. {dict.footer.rights}</p>
          <p className="flex items-center gap-1.5">
            {dict.footer.madeInPrefix}
            <span className="inline-block h-3 w-4 rounded-sm bg-gradient-to-r from-[#FF8200] via-white to-[#009A44]" />
            {dict.footer.madeIn}
          </p>
        </div>
      </div>
    </footer>
  );
}
