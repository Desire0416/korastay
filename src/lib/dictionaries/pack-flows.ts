// ============================================================
// Parcours packs : reservation d'un pack + pack sur mesure.
// ============================================================

export interface PackCheckoutDict {
  metaTitle: string;
  eyebrow: string;
  back: string;
  title: string;
  departure: string; // {date}
  payNowFull: string;
  secure: string;
  validationDelay: string;
}

export interface CustomPackDict {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  accent: string;
  subtitle: string;
  empty: string;
  step1: string;
  step2: string;
  noServices: string;
  from: string; // {price}
  cart: string; // {city}
  cartEmpty: string;
  remove: string;
  travelers: string;
  desiredDate: string;
  subtotal: string;
  serviceFee: string;
  estimatedTotal: string;
  name: string;
  namePlaceholder: string;
  email: string;
  phone: string;
  notesPlaceholder: string;
  submit: string;
  disclaimer: string;
  errorEmpty: string;
  errorContact: string;
  errorGeneric: string;
  doneTitle: string;
  doneText: string; // {ref}
  track: string;
  another: string;
  types: Record<string, string>;
}

export const packCheckoutFr: PackCheckoutDict = {
  metaTitle: "Réserver un pack",
  eyebrow: "Réservation",
  back: "Retour au pack",
  title: "Réserver votre pack",
  departure: "Départ le {date}",
  payNowFull: "À payer maintenant (100 %)",
  secure: "Paiement suivi par KoraStay · partenaires vérifiés",
  validationDelay: "7 jours",
};

export const packCheckoutEn: PackCheckoutDict = {
  metaTitle: "Book a pack",
  eyebrow: "Booking",
  back: "Back to the pack",
  title: "Book your pack",
  departure: "Departure on {date}",
  payNowFull: "Due now (100%)",
  secure: "Payment tracked by KoraStay · vetted partners",
  validationDelay: "7 days",
};

export const customPackFr: CustomPackDict = {
  metaTitle: "Composer mon pack",
  metaDescription:
    "Composez votre pack sur mesure : activités, guides, transport et restauration locaux. Voyez le prix et envoyez votre demande.",
  eyebrow: "Sur mesure",
  title: "Composez votre",
  accent: "pack idéal.",
  subtitle:
    "Choisissez votre destination, ajoutez les activités et partenaires locaux qui vous plaisent, visualisez le prix et envoyez votre pack pour validation.",
  empty: "Aucun partenaire n'est encore disponible. Revenez bientôt !",
  step1: "Choisissez votre destination",
  step2: "Sélectionnez vos activités & partenaires",
  noServices: "Aucun partenaire disponible dans cette ville pour le moment.",
  from: "dès {price}",
  cart: "Votre pack {city}",
  cartEmpty: "Ajoutez des prestations pour composer votre pack.",
  remove: "retirer",
  travelers: "Voyageurs",
  desiredDate: "Date souhaitée",
  subtotal: "Sous-total",
  serviceFee: "Frais de service",
  estimatedTotal: "Total estimé",
  name: "Nom",
  namePlaceholder: "Votre nom",
  email: "E-mail",
  phone: "Téléphone",
  notesPlaceholder: "Précisions (facultatif)…",
  submit: "Envoyer mon pack",
  disclaimer: "Devis indicatif. Notre équipe confirme la disponibilité.",
  errorEmpty: "Ajoutez au moins une prestation à votre pack.",
  errorContact: "Renseignez votre nom et un e-mail valide.",
  errorGeneric: "Une erreur est survenue.",
  doneTitle: "Pack envoyé !",
  doneText:
    "Votre pack personnalisé {ref} a été envoyé. Notre équipe et les partenaires concernés ont été prévenus et reviennent vers vous rapidement.",
  track: "Suivre ma demande",
  another: "Composer un autre pack",
  types: {
    GUIDE: "Guides & visites",
    TRANSPORT: "Transport",
    RESTAURANT: "Restauration",
    ACTIVITY: "Activités",
    OTHER: "Autres prestations",
  },
};

export const customPackEn: CustomPackDict = {
  metaTitle: "Build my pack",
  metaDescription:
    "Build your tailor-made pack: local activities, guides, transport and dining. See the price and send your request.",
  eyebrow: "Tailor-made",
  title: "Build your",
  accent: "ideal pack.",
  subtitle:
    "Pick your destination, add the local activities and partners you like, see the price and send your pack for validation.",
  empty: "No partners are available yet. Check back soon!",
  step1: "Choose your destination",
  step2: "Select your activities & partners",
  noServices: "No partners available in this city yet.",
  from: "from {price}",
  cart: "Your {city} pack",
  cartEmpty: "Add services to build your pack.",
  remove: "remove",
  travelers: "Travellers",
  desiredDate: "Preferred date",
  subtotal: "Subtotal",
  serviceFee: "Service fee",
  estimatedTotal: "Estimated total",
  name: "Name",
  namePlaceholder: "Your name",
  email: "Email",
  phone: "Phone",
  notesPlaceholder: "Details (optional)…",
  submit: "Send my pack",
  disclaimer: "Indicative quote. Our team confirms availability.",
  errorEmpty: "Add at least one service to your pack.",
  errorContact: "Enter your name and a valid email.",
  errorGeneric: "Something went wrong.",
  doneTitle: "Pack sent!",
  doneText:
    "Your custom pack {ref} has been sent. Our team and the partners involved have been notified and will get back to you shortly.",
  track: "Track my request",
  another: "Build another pack",
  types: {
    GUIDE: "Guides & tours",
    TRANSPORT: "Transport",
    RESTAURANT: "Dining",
    ACTIVITY: "Activities",
    OTHER: "Other services",
  },
};
