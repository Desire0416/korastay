import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { MobileNavSheet } from "./mobile-nav-sheet";
import { LanguageSwitcher } from "./language-switcher";
import { PUBLIC_NAV } from "@/lib/navigation";
import { getCurrentUser } from "@/lib/auth";
import { navLabel } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n.server";

export async function PublicHeader() {
  const user = await getCurrentUser();
  const { locale, dict } = await getI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-lg">
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-surface-soft hover:text-foreground"
              >
                {navLabel(dict, item.href, item.label)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/devenir-proprietaire"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft md:block"
          >
            {dict.header.becomeHost}
          </Link>
          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} />
          </div>

          {user ? (
            <div className="hidden md:block">
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{dict.header.login}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{dict.header.register}</Link>
              </Button>
            </div>
          )}

          <MobileNavSheet user={user} locale={locale} dict={dict} />
        </div>
      </div>
    </header>
  );
}
