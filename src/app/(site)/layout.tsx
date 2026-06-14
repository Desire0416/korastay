import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { MobileBottomNav } from "@/components/public/mobile-bottom-nav";
import { VisitBeacon } from "@/components/public/visit-beacon";
import { WhatsAppFab } from "@/components/public/whatsapp-fab";
import { getWhatsAppNumber, buildWhatsAppLink } from "@/lib/whatsapp";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const waLink = buildWhatsAppLink(
    await getWhatsAppNumber(),
    "Bonjour KoraStay, j'aimerais avoir des informations sur vos hébergements.",
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <VisitBeacon />
      <PublicHeader />
      <main className="flex-1 pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <PublicFooter />
      {waLink && <WhatsAppFab href={waLink} />}
      <MobileBottomNav />
    </div>
  );
}
