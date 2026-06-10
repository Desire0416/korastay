import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { LeadForm } from "@/components/public/lead-form";
import { submitContact } from "@/server/actions/leads";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";

export const metadata = { title: "Contact", description: "Contactez l'equipe KoraStay." };

export default function ContactPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">Contactez-nous</h1>
        <p className="mt-3 text-muted">Une question, une demande ? Notre equipe vous repond rapidement.</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
            { icon: Phone, label: "Telephone", value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}` },
            { icon: MapPin, label: "Zone", value: "Cote d'Ivoire - Afrique de l'Ouest" },
            { icon: Clock, label: "Horaires", value: "Lun - Sam, 8h - 19h" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase text-muted">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="font-semibold text-foreground hover:text-brand-600">{c.value}</a>
                ) : (
                  <p className="font-semibold text-foreground">{c.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-4xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h2 className="mb-5 text-xl font-bold text-foreground">Envoyez-nous un message</h2>
          <LeadForm
            action={submitContact}
            submitLabel="Envoyer le message"
            fields={[
              { name: "name", label: "Nom", required: true, placeholder: "Votre nom" },
              { name: "email", label: "Email", type: "email", required: true, placeholder: "vous@email.com" },
              { name: "subject", label: "Sujet", required: true, full: true, placeholder: "Objet de votre message" },
              { name: "message", label: "Message", type: "textarea", required: true, placeholder: "Comment pouvons-nous vous aider ?" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
