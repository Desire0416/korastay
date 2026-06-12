import {
  Briefcase, Receipt, Wifi, Headset, FileSignature, Users, ArrowRight, Building2,
} from "lucide-react";
import { LeadForm } from "@/components/public/lead-form";
import { submitBusinessRequest } from "@/server/actions/leads";

export const metadata = {
  title: "KoraStay Business",
  description: "Hébergements professionnels fiables et facturables pour vos équipes en mission en Afrique de l'Ouest.",
};

const BENEFITS = [
  { icon: Receipt, title: "Facturation dediee", text: "Factures entreprise, TVA si applicable, bon de commande." },
  { icon: Wifi, title: "Logements équipes", text: "WiFi fiable, espace bureau, calme et proximité des services." },
  { icon: FileSignature, title: "Contrat cadre", text: "Tarifs negocies pour vos réservations recurrentes." },
  { icon: Headset, title: "Assistance dediee", text: "Un interlocuteur KoraStay Business pour vos missions." },
  { icon: Users, title: "Gestion d'équipe", text: "Centralisez les réservations de vos collaborateurs." },
  { icon: Building2, title: "Rapport mensuel", text: "Récapitulatif des séjours et depenses par mission." },
];

const CASES = ["ONG en mission terrain", "Entreprise en deplacement", "Delegation officielle", "Équipe projet"];

export default function BusinessPage() {
  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              <Briefcase className="h-3.5 w-3.5" /> KoraStay Business
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Des séjours professionnels fiables, facturables et assistes.
            </h1>
            <p className="mt-4 max-w-lg text-muted">
              KoraStay accompagné entreprises, ONG, administrations et institutions
              pour loger leurs équipes en mission partout en Côte d'Ivoire.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CASES.map((c) => (
                <span key={c} className="rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-foreground shadow-soft">{c}</span>
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-border bg-surface p-6 shadow-card sm:p-8" id="devis">
            <h2 className="text-xl font-bold text-foreground">Demander un devis</h2>
            <p className="mb-5 mt-1 text-sm text-muted">Réponse sous 48h ouvrees.</p>
            <LeadForm
              action={submitBusinessRequest}
              submitLabel="Envoyer la demande"
              fields={[
                { name: "organizationName", label: "Organisation", required: true, placeholder: "Nom de l'entreprise" },
                { name: "organizationType", label: "Type", type: "select", options: [
                  { value: "Entreprise", label: "Entreprise" }, { value: "ONG", label: "ONG" },
                  { value: "Administration", label: "Administration" }, { value: "Institution", label: "Institution" },
                ], placeholder: "Type d'organisation" },
                { name: "contactName", label: "Contact", required: true, placeholder: "Votre nom" },
                { name: "email", label: "Email", type: "email", required: true, placeholder: "vous@entreprise.com" },
                { name: "phone", label: "Téléphone", type: "tel", placeholder: "+225 ..." },
                { name: "city", label: "Ville de mission", placeholder: "Daloa, Man..." },
                { name: "teamSize", label: "Taille équipe", type: "number", placeholder: "5" },
                { name: "notes", label: "Vos besoins", type: "textarea", placeholder: "Dates, exigences, budget..." },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="mb-8 text-center font-display text-3xl font-semibold text-foreground">
          Pourquoi choisir KoraStay Business
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <b.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold text-foreground">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
