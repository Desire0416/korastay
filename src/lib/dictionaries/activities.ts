// ============================================================
// Activites : catalogue, fiche et widget de reservation.
// ============================================================

export interface ActivitiesDict {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  accent: string;
  subtitle: string;
  allCategories: string;
  emptyTitle: string;
  emptyDesc: string;
  notFound: string;
  breadcrumb: string;
  personsRange: string; // {min} {max}
  aboutTitle: string;
  includedTitle: string;
  meetingPoint: string;
  difficulty: string;
  duration: string;
  groupSize: string;
  fromPrice: string; // {price}
  loginText: string;
  loginCta: string;
  widget: {
    perPerson: string;
    desiredDate: string;
    participants: string;
    chooseGuide: string;
    noGuide: string;
    fullName: string;
    email: string;
    phone: string;
    acceptPrefix: string;
    terms: string;
    recapNote: string;
    submit: string;
  };
}

export const activitiesFr: ActivitiesDict = {
  metaTitle: "Activités & expériences",
  metaDescription:
    "Excursions, visites de sites, expériences culturelles et sorties nature dans les villes couvertes par KoraStay, avec un guide vérifié.",
  eyebrow: "KoraStay Activités",
  title: "Vivez des expériences",
  accent: "inoubliables.",
  subtitle: "Excursions, visites, culture et nature. Chaque activité se réserve avec un guide vérifié par KoraStay.",
  allCategories: "Toutes",
  emptyTitle: "Aucune activité",
  emptyDesc: "Aucune activité ne correspond à ces critères pour le moment.",
  notFound: "Activité",
  breadcrumb: "Activités",
  personsRange: "{min} à {max} personnes",
  aboutTitle: "À propos de cette activité",
  includedTitle: "Ce qui est inclus",
  meetingPoint: "Point de rendez-vous",
  difficulty: "Niveau",
  duration: "Durée",
  groupSize: "Groupe",
  fromPrice: "À partir de {price} / pers.",
  loginText: "Connectez-vous pour réserver cette activité avec un guide.",
  loginCta: "Se connecter pour réserver",
  widget: {
    perPerson: "/ personne",
    desiredDate: "Date souhaitée",
    participants: "Participants",
    chooseGuide: "Choisissez votre guide",
    noGuide: "Aucun guide vérifié n'est disponible dans cette ville pour le moment. Revenez bientôt.",
    fullName: "Nom complet",
    email: "E-mail",
    phone: "Téléphone",
    acceptPrefix: "J'accepte les ",
    terms: "conditions générales",
    recapNote: "Frais de service ajoutés à l'étape suivante. Aucun paiement maintenant : validation, puis acompte.",
    submit: "Envoyer ma demande",
  },
};

export const activitiesEn: ActivitiesDict = {
  metaTitle: "Activities & experiences",
  metaDescription:
    "Excursions, site visits, cultural experiences and nature outings in the cities KoraStay covers, with a vetted guide.",
  eyebrow: "KoraStay Activities",
  title: "Experiences",
  accent: "worth remembering.",
  subtitle: "Excursions, visits, culture and nature. Every activity is booked with a guide vetted by KoraStay.",
  allCategories: "All",
  emptyTitle: "No activities",
  emptyDesc: "No activity matches these filters for now.",
  notFound: "Activity",
  breadcrumb: "Activities",
  personsRange: "{min} to {max} people",
  aboutTitle: "About this activity",
  includedTitle: "What's included",
  meetingPoint: "Meeting point",
  difficulty: "Level",
  duration: "Duration",
  groupSize: "Group",
  fromPrice: "From {price} / person",
  loginText: "Log in to book this activity with a guide.",
  loginCta: "Log in to book",
  widget: {
    perPerson: "/ person",
    desiredDate: "Preferred date",
    participants: "Participants",
    chooseGuide: "Choose your guide",
    noGuide: "No vetted guide is available in this city yet. Check back soon.",
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    acceptPrefix: "I accept the ",
    terms: "terms & conditions",
    recapNote: "Service fees are added at the next step. Nothing to pay now: validation first, then a deposit.",
    submit: "Send my request",
  },
};
