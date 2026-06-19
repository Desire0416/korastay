import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { MobileNavSheet } from "./mobile-nav-sheet";
import { LanguageSwitcher } from "./language-switcher";
import { HeaderNav } from "./header-nav";
import { PUBLIC_NAV } from "@/lib/navigation";
import { getCurrentUser } from "@/lib/auth";
import { navLabel, localePath } from "@/lib/i18n";
import { getI18n, getPathname } from "@/lib/i18n.server";

export async function PublicHeader() {
  const user = await getCurrentUser();
  const { locale, dict } = await getI18n();
  const currentPath = await getPathname();

  const navItems = PUBLIC_NAV.map((item) => ({
    href: localePath(item.href, locale),
    label: navLabel(dict, item.href, item.label),
  }));

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
        <div className="flex items-center gap-6 xl:gap-8">
          <Logo />
          <HeaderNav items={navItems} />
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={localePath("/devenir-proprietaire", locale)}
            className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-surface-soft hover:text-foreground lg:block"
          >
            {dict.header.becomeHost}
          </Link>

          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} currentPath={currentPath} />
          </div>

          <span className="mx-1.5 hidden h-6 w-px bg-border md:block" />

          {user ? (
            <div className="hidden md:block">
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href={localePath("/login", locale)}>{dict.header.login}</Link>
              </Button>
              <Link
                href={localePath("/register", locale)}
                className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-4 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-500 hover:to-brand-400 hover:shadow-card"
              >
                {dict.header.register}
              </Link>
            </div>
          )}

          <MobileNavSheet user={user} locale={locale} dict={dict} currentPath={currentPath} />
        </div>
      </div>

      {/* Fine ligne degradee elegante en bas du header */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </header>
  );
}
