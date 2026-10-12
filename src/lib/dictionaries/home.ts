// ============================================================
// Dictionnaire de la page d'accueil v2 (desktop + mobile).
// Un module par page refaite : i18n.ts ne garde que l'assemblage.
// ============================================================

type Heading = { eyebrow: string; title: string; accent: string };

export interface HomeDict {
  meta: { title: string; description: string };
  hero: Heading & {
    subtitle: string;
    trust: string[];
    circleText: string;
    floatingLabel: string;
    perNight: string;
    stats: { stays: string; destinations: string; packs: string };
  };
  destinations: Heading & { desc: string };
  residences: Heading & { desc: string };
  experiences: Heading & {
    desc: string;
    packsLabel: string;
    activitiesLabel: string;
    seePacks: string;
    seeActivities: string;
    custom: { title: string; text: string; cta: string };
  };
  how: Heading & { steps: { title: string; text: string }[] };
  why: Heading & { desc: string; cta: string; items: { title: string; text: string }[] };
  stats: Heading & {
    description: string;
    visits: string;
    travelers: string;
    owners: string;
    guides: string;
    partners: string;
    residences: string;
    destinations: string;
    packs: string;
  };
  owner: Heading & { text: string; points: string[]; cta: string };
  business: Heading & { text: string; points: string[]; cta: string };
  testimonials: Heading;
  faq: Heading & {
    desc: string;
    items: { q: string; a: string }[];
    moreTitle: string;
    moreCta: string;
    allFaq: string;
  };
  mobile: {
    tabs: { residences: string; packs: string; activities: string };
    popular: string;
    noPacks: string;
    noActivities: string;
    viewAria: string; // gabarit avec {title}
  };
}

export const homeFr: HomeDict = {
  meta: {
    title: "KoraStay - Réservez votre séjour, vivez l'Afrique de l'Ouest",
    description:
      "Logements meublés vérifiés, packs découverte et activités en Côte d'Ivoire. Réservez en ligne, payez en Mobile Money.",
  },
  hero: {
    eyebrow: "Côte d'Ivoire · Afrique de l'Ouest",
    title: "Vivez l'Afrique de l'Ouest,",
    accent: "autrement.",
    subtitle:
      "Logements meublés vérifiés, packs découverte et guides locaux : KoraStay réunit tout ce qu'il faut pour un séjour serein, de la réservation au retour.",
    trust: ["Logements contrôlés", "Paiement Mobile Money", "Assistance locale"],
    circleText: "Séjours vérifiés · Akwaba · KoraStay · ",
    floatingLabel: "Coup de cœur voyageurs",
    perNight: "/ nuit",
    stats: { stays: "logements", destinations: "destinations", packs: "packs découverte" },
  },
  destinations: {
    eyebrow: "Destinations",
    title: "Des villes à vivre,",
    accent: "de la lagune aux savanes.",
    desc: "Bord de mer, montagnes de l'Ouest, villes du Nord : choisissez votre point de départ.",
  },
  residences: {
    eyebrow: "Sélection",
    title: "Nos logements",
    accent: "coups de cœur.",
    desc: "Les adresses les mieux notées par nos voyageurs, toutes contrôlées par l'équipe KoraStay.",
  },
  experiences: {
    eyebrow: "KoraStay Découverte",
    title: "Des séjours",
    accent: "clé en main.",
    desc: "Hébergement, transport et guide local réunis dans un même pack, ou des activités à la carte pour composer votre voyage.",
    packsLabel: "Packs découverte",
    activitiesLabel: "Activités & excursions",
    seePacks: "Tous les packs",
    seeActivities: "Toutes les activités",
    custom: {
      title: "Un voyage sur mesure ?",
      text: "Indiquez vos dates, votre ville et vos envies : nous vous préparons une proposition.",
      cta: "Composer mon pack",
    },
  },
  how: {
    eyebrow: "Comment ça marche",
    title: "Réserver en",
    accent: "trois temps.",
    steps: [
      {
        title: "Choisissez",
        text: "Comparez logements, packs et activités : photos, avis des voyageurs et prix clairs en F CFA.",
      },
      {
        title: "Réservez & payez",
        text: "Envoyez votre demande, réglez en Mobile Money ou par virement : notre équipe vérifie chaque paiement.",
      },
      {
        title: "Vivez votre séjour",
        text: "Votre réservation est confirmée et notre équipe reste joignable avant, pendant et après.",
      },
    ],
  },
  why: {
    eyebrow: "Pourquoi KoraStay",
    title: "Voyagez",
    accent: "l'esprit tranquille.",
    desc: "Une plateforme pensée pour la confiance, du premier clic au retour de séjour.",
    cta: "Notre charte qualité",
    items: [
      {
        title: "Logements contrôlés",
        text: "Propreté, sécurité, équipements : chaque adresse est vérifiée par notre équipe avant publication.",
      },
      {
        title: "Paiement local et suivi",
        text: "Wave, Orange Money, MTN MoMo, Moov Money ou virement. Chaque paiement est vérifié par KoraStay.",
      },
      {
        title: "Assistance locale",
        text: "Une équipe basée en Côte d'Ivoire, joignable avant, pendant et après votre séjour.",
      },
      {
        title: "Partenaires sélectionnés",
        text: "Guides, chauffeurs et restaurants vérifiés pour une expérience authentique.",
      },
    ],
  },
  stats: {
    eyebrow: "KoraStay en chiffres",
    title: "Une communauté",
    accent: "qui grandit.",
    description: "Voyageurs, propriétaires et partenaires locaux nous font déjà confiance.",
    visits: "Visites",
    travelers: "Voyageurs",
    owners: "Propriétaires",
    guides: "Guides",
    partners: "Partenaires",
    residences: "Logements",
    destinations: "Destinations",
    packs: "Packs",
  },
  owner: {
    eyebrow: "Propriétaires",
    title: "Votre logement mérite",
    accent: "les bons voyageurs.",
    text: "Publiez votre résidence, gérez calendrier, offres et revenus depuis votre espace, et recevez des réservations de voyageurs identifiés.",
    points: ["Publication accompagnée", "Calendrier & offres de prix", "Reversements suivis"],
    cta: "Devenir propriétaire",
  },
  business: {
    eyebrow: "KoraStay Business",
    title: "Vos équipes en mission,",
    accent: "bien logées.",
    text: "Des hébergements fiables et facturables pour vos collaborateurs, avec devis, factures et équipe gérés au même endroit.",
    points: ["Devis sur demande", "Factures centralisées", "Gestion d'équipe"],
    cta: "Demander un devis",
  },
  testimonials: {
    eyebrow: "Témoignages",
    title: "Ils ont voyagé",
    accent: "avec KoraStay.",
  },
  faq: {
    eyebrow: "Questions fréquentes",
    title: "Tout savoir",
    accent: "avant de partir.",
    desc: "Les réponses aux questions que se posent le plus souvent nos voyageurs.",
    items: [
      {
        q: "Comment savoir si un logement est fiable ?",
        a: "Les logements qui affichent le badge « Vérifié » ont été contrôlés par notre équipe : propreté, sécurité, équipements et conformité à l'annonce.",
      },
      {
        q: "Quels moyens de paiement sont acceptés ?",
        a: "Wave, Orange Money, MTN MoMo, Moov Money et virement bancaire. Vous envoyez le paiement selon les instructions affichées, déclarez la transaction, puis notre équipe la vérifie et confirme votre réservation.",
      },
      {
        q: "Puis-je annuler ma réservation ?",
        a: "Oui. Logements : remboursement intégral à plus de 72 h de l'arrivée, 50 % entre 24 et 72 h, rien à moins de 24 h. Packs : intégral à plus de 7 jours du départ, 50 % entre 3 et 7 jours, rien à moins de 3 jours. Les frais de service ne sont pas remboursés ; des conditions particulières peuvent figurer sur une fiche.",
      },
      {
        q: "Puis-je proposer mon prix ?",
        a: "Oui : au moment de réserver un logement, vous pouvez faire une offre au propriétaire. Il l'accepte, la refuse ou vous fait une contre-offre, valable 24 h.",
      },
      {
        q: "Qu'est-ce qu'un Pack Découverte ?",
        a: "Un séjour clé en main qui réunit hébergement vérifié, transport et guide local pour découvrir une destination sans rien organiser. Le contenu exact est détaillé sur chaque pack.",
      },
    ],
    moreTitle: "Une autre question ?",
    moreCta: "Contacter l'équipe",
    allFaq: "Toute la FAQ",
  },
  mobile: {
    tabs: { residences: "Logements", packs: "Packs", activities: "Activités" },
    popular: "Populaire",
    noPacks: "Aucun pack disponible pour le moment.",
    noActivities: "Aucune activité disponible pour le moment.",
    viewAria: "Voir tout : {title}",
  },
};

export const homeEn: HomeDict = {
  meta: {
    title: "KoraStay - Book your stay, experience West Africa",
    description:
      "Verified furnished homes, discovery packs and activities in Côte d'Ivoire. Book online, pay by Mobile Money.",
  },
  hero: {
    eyebrow: "Côte d'Ivoire · West Africa",
    title: "Experience West Africa,",
    accent: "differently.",
    subtitle:
      "Verified furnished homes, discovery packs and local guides: KoraStay brings together everything you need for a worry-free stay, from booking to coming home.",
    trust: ["Vetted homes", "Mobile Money payment", "Local support"],
    circleText: "Verified stays · Akwaba · KoraStay · ",
    floatingLabel: "Guest favourite",
    perNight: "/ night",
    stats: { stays: "homes", destinations: "destinations", packs: "discovery packs" },
  },
  destinations: {
    eyebrow: "Destinations",
    title: "Cities worth living,",
    accent: "from lagoon to savannah.",
    desc: "Seaside towns, western mountains, northern cities: pick your starting point.",
  },
  residences: {
    eyebrow: "Selection",
    title: "Our favourite",
    accent: "homes.",
    desc: "The places our guests rate highest, every one of them vetted by the KoraStay team.",
  },
  experiences: {
    eyebrow: "KoraStay Discovery",
    title: "Stays,",
    accent: "all taken care of.",
    desc: "Accommodation, transport and a local guide in a single pack, or activities à la carte to build your own trip.",
    packsLabel: "Discovery packs",
    activitiesLabel: "Activities & excursions",
    seePacks: "All packs",
    seeActivities: "All activities",
    custom: {
      title: "A tailor-made trip?",
      text: "Tell us your dates, city and wishes: we will prepare a proposal for you.",
      cta: "Build my pack",
    },
  },
  how: {
    eyebrow: "How it works",
    title: "Book in",
    accent: "three steps.",
    steps: [
      {
        title: "Choose",
        text: "Compare homes, packs and activities: photos, guest reviews and clear prices in F CFA.",
      },
      {
        title: "Book & pay",
        text: "Send your request and pay by Mobile Money or bank transfer: our team checks every payment.",
      },
      {
        title: "Enjoy your stay",
        text: "Your booking is confirmed and our team stays reachable before, during and after.",
      },
    ],
  },
  why: {
    eyebrow: "Why KoraStay",
    title: "Travel with",
    accent: "peace of mind.",
    desc: "A platform built on trust, from the first click to the trip home.",
    cta: "Our quality charter",
    items: [
      {
        title: "Vetted homes",
        text: "Cleanliness, safety, amenities: every address is checked by our team before it goes live.",
      },
      {
        title: "Local, tracked payment",
        text: "Wave, Orange Money, MTN MoMo, Moov Money or bank transfer. Every payment is verified by KoraStay.",
      },
      {
        title: "Local support",
        text: "A team based in Côte d'Ivoire, reachable before, during and after your stay.",
      },
      {
        title: "Hand-picked partners",
        text: "Vetted guides, drivers and restaurants for an authentic experience.",
      },
    ],
  },
  stats: {
    eyebrow: "KoraStay in numbers",
    title: "A growing",
    accent: "community.",
    description: "Travellers, hosts and local partners already trust us.",
    visits: "Visits",
    travelers: "Travellers",
    owners: "Hosts",
    guides: "Guides",
    partners: "Partners",
    residences: "Homes",
    destinations: "Destinations",
    packs: "Packs",
  },
  owner: {
    eyebrow: "Hosts",
    title: "Your home deserves",
    accent: "the right guests.",
    text: "List your property, manage calendar, offers and income from your dashboard, and receive bookings from identified travellers.",
    points: ["Guided listing", "Calendar & price offers", "Tracked payouts"],
    cta: "Become a host",
  },
  business: {
    eyebrow: "KoraStay Business",
    title: "Your teams on assignment,",
    accent: "well housed.",
    text: "Reliable, invoiceable accommodation for your staff, with quotes, invoices and team managed in one place.",
    points: ["Quotes on request", "Centralised invoices", "Team management"],
    cta: "Request a quote",
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "They travelled",
    accent: "with KoraStay.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Everything to know",
    accent: "before you go.",
    desc: "Answers to the questions our travellers ask most often.",
    items: [
      {
        q: "How do I know a home is reliable?",
        a: "Homes showing the “Verified” badge have been checked by our team: cleanliness, safety, amenities and accuracy of the listing.",
      },
      {
        q: "Which payment methods are accepted?",
        a: "Wave, Orange Money, MTN MoMo, Moov Money and bank transfer. You send the payment following the instructions shown, declare the transaction, then our team verifies it and confirms your booking.",
      },
      {
        q: "Can I cancel my booking?",
        a: "Yes. Homes: full refund more than 72 h before arrival, 50% between 24 and 72 h, nothing within 24 h. Packs: full refund more than 7 days before departure, 50% between 3 and 7 days, nothing within 3 days. Service fees are not refunded; specific conditions may be shown on a listing.",
      },
      {
        q: "Can I suggest my own price?",
        a: "Yes: when booking a home you can make an offer to the host. They accept it, decline it or send you a counter-offer, valid for 24 h.",
      },
      {
        q: "What is a Discovery Pack?",
        a: "A ready-made stay combining verified accommodation, transport and a local guide, so you can explore a destination without organising a thing. Exact contents are detailed on each pack.",
      },
    ],
    moreTitle: "Another question?",
    moreCta: "Contact the team",
    allFaq: "Full FAQ",
  },
  mobile: {
    tabs: { residences: "Homes", packs: "Packs", activities: "Activities" },
    popular: "Popular",
    noPacks: "No packs available yet.",
    noActivities: "No activities available yet.",
    viewAria: "See all: {title}",
  },
};
