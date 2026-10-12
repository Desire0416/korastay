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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
        <div className="flex items-center gap-8 xl:gap-12">
          <Logo />
          <HeaderNav items={navItems} />
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={localePath("/devenir-proprietaire", locale)}
            className="hidden rounded-full px-3.5 py-2 text-[14px] font-semibold text-foreground/75 transition-colors hover:text-ink xl:block"
          >
            {dict.header.becomeHost}
          </Link>

          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} currentPath={currentPath} />
          </div>

          <span className="mx-2 hidden h-5 w-px bg-ink/15 md:block" />

          {user ? (
            <div className="hidden md:block">
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href={localePath("/login", locale)}>{dict.header.login}</Link>
              </Button>
              <Button asChild variant="dark" size="sm" className="px-5">
                <Link href={localePath("/register", locale)}>{dict.header.register}</Link>
              </Button>
            </div>
          )}

          <MobileNavSheet user={user} locale={locale} dict={dict} currentPath={currentPath} />
        </div>
      </div>
    </header>
  );
}
