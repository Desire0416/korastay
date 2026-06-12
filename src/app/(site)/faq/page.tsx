import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata = { title: "FAQ", description: "Questions frequentes sur KoraStay." };

const SECTIONS = [
  {
    title: "Réservation & paiement",
    items: [
      { q: "Comment réserver une résidence ?", a: "Recherchez une ville et des dates, choisissez une résidence, sélectionnez vos dates et voyageurs, puis confirmez et payez en ligne. Votre réservation est confirmée immédiatement." },
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Orange Money, Wave, carte bancaire Visa/Mastercard, et bientot MTN MoMo. Le paiement est securise." },
      { q: "Le paiement est-il sécurisé ?", a: "Oui. Les transactions sont traitees via des prestataires agrees. KoraStay ne stocke pas vos informations de paiement." },
    ],
  },
  {
    title: "Annulation & remboursement",
    items: [
      { q: "Puis-je annuler ma réservation ?", a: "Oui. Résidences : remboursement intégral a plus de 72h du check-in, 50% entre 24 et 72h, aucun a moins de 24h. Packs : intégral a plus de 7 jours, 50% entre 3 et 7 jours." },
      { q: "Quand suis-je rembourse ?", a: "Après validation de votre demande, le remboursement est traite selon le moyen de paiement initial, hors frais de service." },
    ],
  },
  {
    title: "Résidences & packs",
    items: [
      { q: "Qu'est-ce qu'une résidence vérifiée ?", a: "Une résidence contrôlée par notre équipe selon des critères de propreté, sécurité, équipement et conformite, affichant le badge Résidence vérifiée KoraStay." },
      { q: "Qu'inclut un Pack Découverte ?", a: "Hébergement vérifié, petit dejeuner, transport en ville et guide local certifie. Les détails figurent sur chaque fiche pack." },
    ],
  },
  {
    title: "Propriétaires & partenaires",
    items: [
      { q: "Comment publier ma résidence ?", a: "Rendez-vous sur la page Devenir propriétaire, soumettez votre demande, et après validation, publiez votre bien depuis votre espace." },
      { q: "Comment devenir partenaire ?", a: "Guides, transporteurs, restaurants et prestataires peuvent rejoindre le réseau via la page Partenaires. L'inscription est gratuite." },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">Questions frequentes</h1>
          <p className="mt-3 text-muted">Tout ce qu'il faut savoir pour voyager sereinement avec KoraStay.</p>
        </div>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="mb-3 text-lg font-bold text-brand-700">{section.title}</h2>
              <Accordion type="single" collapsible className="space-y-3">
                {section.items.map((item, i) => (
                  <AccordionItem key={i} value={`${section.title}-${i}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-surface-soft p-8 text-center">
          <h3 className="text-lg font-bold text-foreground">Vous ne trouvez pas votre réponse ?</h3>
          <p className="mt-1 text-muted">Notre équipe est la pour vous aider.</p>
          <Button asChild className="mt-4"><Link href="/contact">Contacter l'assistance</Link></Button>
        </div>
      </div>
    </div>
  );
}
