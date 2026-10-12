// ============================================================
// Espace entreprise (/business) : demandes, devis, equipe, factures.
// ============================================================

export interface DashBusinessDict {
  home: {
    metaTitle: string; subtitle: string; newRequest: string;
    kpiRequests: string; kpiOpen: string; kpiConfirmed: string; recent: string;
    emptyTitle: string; emptyText: string; request: string;
  };
  requests: {
    metaTitle: string; title: string; subtitle: string; new: string; created: string;
    searchPlaceholder: string; allStatuses: string; emptyTitle: string; emptyText: string; noResultText: string;
    persons: string;
  };
  newRequest: {
    metaTitle: string; back: string; title: string; subtitle: string; submit: string;
    needType: string; needTypePh: string; city: string; cityPh: string; teamSize: string; budget: string;
    notes: string; notesPh: string;
  };
  detail: {
    steps: string[]; quoteAccepted: string; yourQuote: string; acceptHint: string;
    city: string; team: string; teamValue: string; budget: string; createdAt: string;
  };
  acceptQuote: { label: string; done: string };
  team: { metaTitle: string; title: string; subtitle: string; emptyTitle: string; emptyText: string; admin: string; member: string };
  invoices: {
    metaTitle: string; title: string; subtitle: string; emptyTitle: string; emptyText: string;
    invoice: string; paid: string; pdfSoon: string;
  };
  profile: { metaTitle: string; title: string; subtitle: string; organisation: string; personal: string };
}

export const dashBusinessFr: DashBusinessDict = {
  home: {
    metaTitle: "Tableau de bord entreprise",
    subtitle: "Pilotez vos demandes et séjours professionnels.",
    newRequest: "Nouvelle demande",
    kpiRequests: "Demandes",
    kpiOpen: "En cours",
    kpiConfirmed: "Confirmées",
    recent: "Demandes récentes",
    emptyTitle: "Aucune demande",
    emptyText: "Soumettez une demande pour vos séjours professionnels.",
    request: "Demande",
  },
  requests: {
    metaTitle: "Mes demandes",
    title: "Mes demandes",
    subtitle: "Suivez l'avancement de vos demandes.",
    new: "Nouvelle",
    created: "Votre demande a été envoyée. Un conseiller KoraStay Business vous contactera.",
    searchPlaceholder: "Besoin, ville, organisation…",
    allStatuses: "Tous les statuts",
    emptyTitle: "Aucune demande",
    emptyText: "Créez votre première demande de séjour professionnel.",
    noResultText: "Aucun résultat pour ces critères.",
    persons: "{n} pers.",
  },
  newRequest: {
    metaTitle: "Nouvelle demande",
    back: "Mes demandes",
    title: "Nouvelle demande",
    subtitle: "Décrivez votre besoin d'hébergement professionnel.",
    submit: "Envoyer la demande",
    needType: "Type de besoin",
    needTypePh: "Hébergement d'une équipe en mission",
    city: "Ville de mission",
    cityPh: "Daloa",
    teamSize: "Nombre de personnes",
    budget: "Budget indicatif (F CFA)",
    notes: "Détails",
    notesPh: "Dates, exigences (Wi-Fi, calme…), facturation…",
  },
  detail: {
    steps: ["Reçue", "En traitement", "Devis", "Confirmée"],
    quoteAccepted: "Devis accepté",
    yourQuote: "Votre devis",
    acceptHint: "En acceptant, notre équipe finalisera votre réservation.",
    city: "Ville",
    team: "Équipe",
    teamValue: "{n} personnes",
    budget: "Budget",
    createdAt: "Créée le",
  },
  acceptQuote: { label: "Accepter le devis", done: "Devis accepté." },
  team: {
    metaTitle: "Mon équipe",
    title: "Mon équipe",
    subtitle: "Les membres de votre organisation.",
    emptyTitle: "Aucune équipe",
    emptyText: "Votre compte n'est pas encore rattaché à une organisation.",
    admin: "Administrateur",
    member: "Membre",
  },
  invoices: {
    metaTitle: "Factures",
    title: "Factures",
    subtitle: "Vos factures pour les séjours confirmés.",
    emptyTitle: "Aucune facture",
    emptyText: "Vos factures seront disponibles ici une fois vos demandes confirmées.",
    invoice: "Facture {ref}",
    paid: "Payée",
    pdfSoon: "La génération des factures en PDF sera disponible prochainement.",
  },
  profile: {
    metaTitle: "Profil entreprise",
    title: "Profil entreprise",
    subtitle: "Les informations de votre organisation et vos informations personnelles.",
    organisation: "Organisation",
    personal: "Informations personnelles",
  },
};

export const dashBusinessEn: DashBusinessDict = {
  home: {
    metaTitle: "Business dashboard",
    subtitle: "Manage your requests and business stays.",
    newRequest: "New request",
    kpiRequests: "Requests",
    kpiOpen: "In progress",
    kpiConfirmed: "Confirmed",
    recent: "Recent requests",
    emptyTitle: "No requests yet",
    emptyText: "Submit a request for your business stays.",
    request: "Request",
  },
  requests: {
    metaTitle: "My requests",
    title: "My requests",
    subtitle: "Track the progress of your requests.",
    new: "New",
    created: "Your request has been sent. A KoraStay Business advisor will get in touch.",
    searchPlaceholder: "Need, city, organisation…",
    allStatuses: "All statuses",
    emptyTitle: "No requests yet",
    emptyText: "Create your first business stay request.",
    noResultText: "No results match these filters.",
    persons: "{n} people",
  },
  newRequest: {
    metaTitle: "New request",
    back: "My requests",
    title: "New request",
    subtitle: "Describe your business accommodation needs.",
    submit: "Send request",
    needType: "Type of need",
    needTypePh: "Accommodation for a team on assignment",
    city: "Assignment city",
    cityPh: "Daloa",
    teamSize: "Number of people",
    budget: "Indicative budget (CFA francs)",
    notes: "Details",
    notesPh: "Dates, requirements (Wi-Fi, quiet…), invoicing…",
  },
  detail: {
    steps: ["Received", "In review", "Quote", "Confirmed"],
    quoteAccepted: "Quote accepted",
    yourQuote: "Your quote",
    acceptHint: "Once you accept, our team will finalise your booking.",
    city: "City",
    team: "Team",
    teamValue: "{n} people",
    budget: "Budget",
    createdAt: "Created on",
  },
  acceptQuote: { label: "Accept quote", done: "Quote accepted." },
  team: {
    metaTitle: "My team",
    title: "My team",
    subtitle: "The members of your organisation.",
    emptyTitle: "No team yet",
    emptyText: "Your account isn't linked to an organisation yet.",
    admin: "Administrator",
    member: "Member",
  },
  invoices: {
    metaTitle: "Invoices",
    title: "Invoices",
    subtitle: "Your invoices for confirmed stays.",
    emptyTitle: "No invoices yet",
    emptyText: "Your invoices will be available here once your requests are confirmed.",
    invoice: "Invoice {ref}",
    paid: "Paid",
    pdfSoon: "PDF invoices will be available soon.",
  },
  profile: {
    metaTitle: "Business profile",
    title: "Business profile",
    subtitle: "Your organisation's details and your personal details.",
    organisation: "Organisation",
    personal: "Personal details",
  },
};
