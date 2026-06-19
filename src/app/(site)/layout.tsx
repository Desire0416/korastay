import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { MobileBottomNav } from "@/components/public/mobile-bottom-nav";
import { VisitBeacon } from "@/components/public/visit-beacon";
import { I18nProvider } from "@/components/i18n/provider";
import { getI18n } from "@/lib/i18n.server";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dict } = await getI18n();

  return (
    <I18nProvider dict={dict}>
      <div className="flex min-h-dvh flex-col">
        <VisitBeacon />
        <PublicHeader />
        <main className="flex-1 pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
        <PublicFooter />
        <MobileBottomNav />
      </div>
    </I18nProvider>
  );
}
