import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata = { title: "FAQ", description: "Questions frequentes sur KoraStay." };

const SECTIONS = [
  {
    title: "Reservation & paiement",
    items: [
      { q: "Comment reserver une residence ?", a: "Recherchez une ville et des dates, choisissez une residence, selectionnez vos dates et voyageurs, puis confirmez et payez en ligne. Votre reservation est confirmee immediatement." },
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Orange Money, Wave, carte bancaire Visa/Mastercard, et bientot MTN MoMo. Le paiement est securise." },
      { q: "Le paiement est-il securise ?", a: "Oui. Les transactions sont traitees via des prestataires agrees. KoraStay ne stocke pas vos informations de paiement." },
    ],
  },
  {
    title: "Annulation & remboursement",
    items: [
      { q: "Puis-je annuler ma reservation ?", a: "Oui. Residences : remboursement integral a plus de 72h du check-in, 50% entre 24 et 72h, aucun a moins de 24h. Packs : integral a plus de 7 jours, 50% entre 3 et 7 jours." },
      { q: "Quand suis-je rembourse ?", a: "Apres validation de votre demande, le remboursement est traite selon le moyen de paiement initial, hors frais de service." },
    ],
  },
  {
    title: "Residences & packs",
    items: [
      { q: "Qu'est-ce qu'une residence verifiee ?", a: "Une residence controlee par notre equipe selon des criteres de proprete, securite, equipement et conformite, affichant le badge Residence verifiee KoraStay." },
      { q: "Qu'inclut un Pack Decouverte ?", a: "Hebergement verifie, petit dejeuner, transport en ville et guide local certifie. Les details figurent sur chaque fiche pack." },
    ],
  },
  {
    title: "Proprietaires & partenaires",
    items: [
      { q: "Comment publier ma residence ?", a: "Rendez-vous sur la page Devenir proprietaire, soumettez votre demande, et apres validation, publiez votre bien depuis votre espace." },
      { q: "Comment devenir partenaire ?", a: "Guides, transporteurs, restaurants et prestataires peuvent rejoindre le reseau via la page Partenaires. L'inscription est gratuite." },
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
          <h3 className="text-lg font-bold text-foreground">Vous ne trouvez pas votre reponse ?</h3>
          <p className="mt-1 text-muted">Notre equipe est la pour vous aider.</p>
          <Button asChild className="mt-4"><Link href="/contact">Contacter l'assistance</Link></Button>
        </div>
      </div>
    </div>
  );
}
