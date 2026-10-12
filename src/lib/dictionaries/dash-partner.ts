// ============================================================
// Espace partenaire (/partner + /partner-onboarding) : guides,
// chauffeurs, restaurants, prestataires d'activites.
// ============================================================

type PartnerTypeKey = "GUIDE" | "TRANSPORT" | "RESTAURANT" | "ACTIVITY" | "OTHER";

export interface DashPartnerDict {
  home: {
    metaTitle: string; noProfileTitle: string; noProfileText: string; contact: string;
    onboardedTitle: string; onboardedText: string; pendingReview: string;
    tips: Record<PartnerTypeKey, string>;
    myMenu: string; dishOne: string; dishMany: string; myVehicle: string; seats: string; toFill: string;
    kpiDishes: string; kpiServices: string; kpiMissions: string; kpiToHandle: string; kpiRevenue: string;
    recentMissions: string; noMissions: string; dateTbd: string; addService: string;
  };
  missions: {
    metaTitle: string; title: string; subtitle: string; searchPlaceholder: string; allStatuses: string;
    emptyTitle: string; emptyText: string; noResultText: string;
    accept: string; decline: string; acceptMission: string; back: string; pack: string;
  };
  calendar: { metaTitle: string; title: string; subtitle: string; emptyTitle: string; emptyText: string };
  revenues: {
    metaTitle: string; title: string; subtitle: string; total: string; missions: string; detail: string;
    emptyTitle: string; emptyText: string;
  };
  services: {
    metaTitle: string; title: string; subtitle: string; add: string; searchPlaceholder: string;
    all: string; active: string; inactive: string; activeBadge: string; inactiveBadge: string;
    emptyTitle: string; emptyText: string; noResultTitle: string; noResultText: string; addService: string;
    from: string; activate: string; deactivate: string;
  };
  newService: {
    metaTitle: string; title: string; subtitle: string; submit: string;
    fTitle: string; fTitlePh: string; city: string; cityPh: string; price: string; duration: string; durationPh: string;
    description: string; descriptionPh: string;
  };
  menu: {
    metaTitle: string; title: string; subtitle: string;
    add: string; editTitle: string; newTitle: string; name: string; namePh: string; price: string; category: string;
    photo: string; description: string; descriptionPh: string; save: string; addToMenu: string;
    confirmDelete: string; deleted: string; emptyTitle: string; emptyText: string; other: string;
    makeUnavailable: string; makeAvailable: string; visible: string; hidden: string; edit: string; delete: string; close: string;
    /** Libelle affiche par categorie (cle = valeur FR stockee en base). */
    categories: Record<string, string>;
  };
  vehicle: { metaTitle: string; title: string; subtitle: string; note: string };
  vehicleForm: {
    type: string; typePh: string; brand: string; plate: string; seats: string;
    license: string; licenseHint: string; submit: string;
  };
  profile: { metaTitle: string; title: string; subtitle: string; personal: string; business: string };
  messages: { subtitle: string; emptyTitle: string; emptyText: string };
  onboarding: {
    metaTitle: string; reviewTitle: string; reviewText: string; backHome: string; title: string; subtitle: string;
    basics: string; phone: string; whatsapp: string; city: string; zones: string; commaHint: string;
    languages: string; languagesPh: string; description: string; descriptionPh: string;
    cuisine: string; cuisinePh: string; docs: string; docsText: string;
    idDoc: string; idDocHint: string; cover: string; coverHint: string; licenseHint: string;
    vehicleTitle: string; spaceLabel: string; submit: string; logout: string;
  };
}

export const dashPartnerFr: DashPartnerDict = {
  home: {
    metaTitle: "Tableau de bord partenaire",
    noProfileTitle: "Profil partenaire en cours de création",
    noProfileText: "Votre profil partenaire n'est pas encore configuré. Contactez l'équipe KoraStay pour finaliser votre inscription.",
    contact: "Contacter KoraStay",
    onboardedTitle: "Configuration terminée !",
    onboardedText: "Bienvenue dans votre espace. Complétez votre offre pour recevoir des missions.",
    pendingReview: "Votre profil est en cours de validation par l'équipe KoraStay.",
    tips: {
      GUIDE: "Proposez vos visites guidées et excursions, indiquez vos langues et les zones couvertes.",
      TRANSPORT: "Proposez vos trajets et transferts (aéroport, gare, interurbain) avec vos tarifs.",
      RESTAURANT: "Présentez vos menus et formules, et vos créneaux de réservation.",
      ACTIVITY: "Proposez vos activités et expériences avec leur durée et un tarif indicatif.",
      OTHER: "Proposez vos prestations avec une description claire et un tarif indicatif.",
    },
    myMenu: "Mon menu",
    dishOne: "{n} plat en ligne",
    dishMany: "{n} plats en ligne",
    myVehicle: "Mon véhicule",
    seats: "{n} places",
    toFill: "À renseigner",
    kpiDishes: "Plats",
    kpiServices: "Services",
    kpiMissions: "Missions",
    kpiToHandle: "À traiter",
    kpiRevenue: "Revenus",
    recentMissions: "Missions récentes",
    noMissions: "Aucune mission pour le moment.",
    dateTbd: "Date à définir",
    addService: "Ajouter un service",
  },
  missions: {
    metaTitle: "Mes missions",
    title: "Mes missions",
    subtitle: "Les missions qui vous sont proposées.",
    searchPlaceholder: "Intitulé, ville…",
    allStatuses: "Tous les statuts",
    emptyTitle: "Aucune mission",
    emptyText: "Les missions proposées apparaîtront ici selon votre ville et votre type de service.",
    noResultText: "Aucun résultat pour ces critères.",
    accept: "Accepter",
    decline: "Refuser",
    acceptMission: "Accepter la mission",
    back: "Mes missions",
    pack: "Pack : {name}",
  },
  calendar: {
    metaTitle: "Calendrier partenaire",
    title: "Calendrier",
    subtitle: "Vos missions à venir.",
    emptyTitle: "Aucune mission programmée",
    emptyText: "Vos missions acceptées apparaîtront ici, par date.",
  },
  revenues: {
    metaTitle: "Revenus partenaire",
    title: "Revenus",
    subtitle: "Vos gains issus des missions réalisées.",
    total: "Revenu total",
    missions: "Missions",
    detail: "Détail",
    emptyTitle: "Aucun revenu",
    emptyText: "Vos revenus apparaîtront après vos premières missions confirmées.",
  },
  services: {
    metaTitle: "Mes services",
    title: "Mes services",
    subtitle: "Les prestations que vous proposez aux voyageurs.",
    add: "Ajouter",
    searchPlaceholder: "Titre, ville, description…",
    all: "Tous",
    active: "Actifs",
    inactive: "Inactifs",
    activeBadge: "Actif",
    inactiveBadge: "Inactif",
    emptyTitle: "Aucun service",
    emptyText: "Ajoutez vos prestations pour recevoir des missions.",
    noResultTitle: "Aucun résultat",
    noResultText: "Aucun service ne correspond à ces critères.",
    addService: "Ajouter un service",
    from: "dès {price}",
    activate: "Activer",
    deactivate: "Désactiver",
  },
  newService: {
    metaTitle: "Nouveau service",
    title: "Ajouter un service",
    subtitle: "Décrivez une prestation que vous proposez.",
    submit: "Créer le service",
    fTitle: "Titre du service",
    fTitlePh: "Visite guidée de Daloa",
    city: "Ville",
    cityPh: "Daloa",
    price: "Prix à partir de (F CFA)",
    duration: "Durée",
    durationPh: "Demi-journée",
    description: "Description",
    descriptionPh: "Ce que comprend la prestation…",
  },
  menu: {
    metaTitle: "Mon menu",
    title: "Mon menu",
    subtitle: "Présentez vos plats et formules avec photo et prix. Les voyageurs les verront sur votre espace.",
    add: "Ajouter un plat",
    editTitle: "Modifier le plat",
    newTitle: "Nouveau plat",
    name: "Nom du plat",
    namePh: "Attiéké poisson",
    price: "Prix (F CFA)",
    category: "Catégorie",
    photo: "Photo du plat",
    description: "Description",
    descriptionPh: "Ingrédients, accompagnement…",
    save: "Enregistrer",
    addToMenu: "Ajouter au menu",
    confirmDelete: "Supprimer ce plat ?",
    deleted: "Plat supprimé.",
    emptyTitle: "Votre menu est vide",
    emptyText: "Ajoutez vos plats avec photo et prix pour les présenter aux voyageurs.",
    other: "Autres",
    makeUnavailable: "Rendre indisponible",
    makeAvailable: "Rendre disponible",
    visible: "Visible",
    hidden: "Masqué",
    edit: "Modifier",
    delete: "Supprimer",
    close: "Fermer",
    categories: {},
  },
  vehicle: {
    metaTitle: "Mon véhicule",
    title: "Mon véhicule",
    subtitle: "Les informations affichées aux voyageurs lors de vos missions de transport.",
    note: "Un véhicule à jour rassure les voyageurs et facilite l'attribution des missions de transfert.",
  },
  vehicleForm: {
    type: "Type de véhicule",
    typePh: "Berline, SUV, minibus, van…",
    brand: "Marque / modèle",
    plate: "Immatriculation",
    seats: "Nombre de places",
    license: "Permis de conduire",
    licenseHint: "Mettez à jour votre permis si nécessaire.",
    submit: "Enregistrer mon véhicule",
  },
  profile: {
    metaTitle: "Profil partenaire",
    title: "Profil partenaire",
    subtitle: "Vos informations professionnelles et personnelles.",
    personal: "Informations personnelles",
    business: "Activité",
  },
  messages: {
    subtitle: "Échangez avec l'équipe KoraStay.",
    emptyTitle: "Aucune conversation",
    emptyText: "Contactez l'équipe KoraStay pour toute question sur vos missions ou votre profil.",
  },
  onboarding: {
    metaTitle: "Configuration partenaire",
    reviewTitle: "Profil en cours de validation",
    reviewText: "Votre profil {name} est en cours de vérification par l'équipe KoraStay. Vous pourrez compléter votre configuration dès qu'il sera validé.",
    backHome: "Retour à l'accueil",
    title: "Finalisez votre configuration",
    subtitle: "Dernière étape avant d'accéder à votre espace : complétez vos informations et joignez vos justificatifs.",
    basics: "Informations de base",
    phone: "Téléphone",
    whatsapp: "WhatsApp",
    city: "Ville principale",
    zones: "Zones couvertes",
    commaHint: "Séparées par des virgules",
    languages: "Langues parlées",
    languagesPh: "Français, anglais, dioula",
    description: "Présentation de votre activité",
    descriptionPh: "Décrivez votre activité, votre expérience, vos points forts…",
    cuisine: "Type de cuisine",
    cuisinePh: "Ivoirienne, fast-food, maquis, gastronomique…",
    docs: "Justificatifs",
    docsText: "Vos documents restent confidentiels et servent uniquement à la vérification.",
    idDoc: "Pièce d'identité",
    idDocHint: "CNI, passeport ou permis (image ou PDF).",
    cover: "Photo de votre espace",
    coverHint: "Visuel affiché aux voyageurs (optionnel).",
    licenseHint: "Obligatoire pour les chauffeurs.",
    vehicleTitle: "Votre véhicule",
    spaceLabel: "Espace {type}",
    submit: "Terminer ma configuration",
    logout: "Se déconnecter",
  },
};

export const dashPartnerEn: DashPartnerDict = {
  home: {
    metaTitle: "Partner dashboard",
    noProfileTitle: "Partner profile being set up",
    noProfileText: "Your partner profile hasn't been configured yet. Contact the KoraStay team to complete your registration.",
    contact: "Contact KoraStay",
    onboardedTitle: "Setup complete!",
    onboardedText: "Welcome to your space. Complete your offer to start receiving missions.",
    pendingReview: "Your profile is being reviewed by the KoraStay team.",
    tips: {
      GUIDE: "Offer your guided tours and excursions, and list your languages and the areas you cover.",
      TRANSPORT: "Offer your trips and transfers (airport, station, intercity) with your rates.",
      RESTAURANT: "Showcase your menus and set menus, and your booking slots.",
      ACTIVITY: "Offer your activities and experiences with their duration and an indicative rate.",
      OTHER: "Offer your services with a clear description and an indicative rate.",
    },
    myMenu: "My menu",
    dishOne: "{n} dish online",
    dishMany: "{n} dishes online",
    myVehicle: "My vehicle",
    seats: "{n} seats",
    toFill: "To complete",
    kpiDishes: "Dishes",
    kpiServices: "Services",
    kpiMissions: "Missions",
    kpiToHandle: "To handle",
    kpiRevenue: "Earnings",
    recentMissions: "Recent missions",
    noMissions: "No missions yet.",
    dateTbd: "Date to be confirmed",
    addService: "Add a service",
  },
  missions: {
    metaTitle: "My missions",
    title: "My missions",
    subtitle: "Missions offered to you.",
    searchPlaceholder: "Title, city…",
    allStatuses: "All statuses",
    emptyTitle: "No missions",
    emptyText: "Missions will appear here based on your city and type of service.",
    noResultText: "No results match these filters.",
    accept: "Accept",
    decline: "Decline",
    acceptMission: "Accept mission",
    back: "My missions",
    pack: "Pack: {name}",
  },
  calendar: {
    metaTitle: "Partner calendar",
    title: "Calendar",
    subtitle: "Your upcoming missions.",
    emptyTitle: "No scheduled missions",
    emptyText: "Your accepted missions will appear here, by date.",
  },
  revenues: {
    metaTitle: "Partner earnings",
    title: "Earnings",
    subtitle: "Your earnings from completed missions.",
    total: "Total earnings",
    missions: "Missions",
    detail: "Breakdown",
    emptyTitle: "No earnings yet",
    emptyText: "Your earnings will appear after your first confirmed missions.",
  },
  services: {
    metaTitle: "My services",
    title: "My services",
    subtitle: "The services you offer to travellers.",
    add: "Add",
    searchPlaceholder: "Title, city, description…",
    all: "All",
    active: "Active",
    inactive: "Inactive",
    activeBadge: "Active",
    inactiveBadge: "Inactive",
    emptyTitle: "No services yet",
    emptyText: "Add your services to start receiving missions.",
    noResultTitle: "No results",
    noResultText: "No service matches these filters.",
    addService: "Add a service",
    from: "from {price}",
    activate: "Activate",
    deactivate: "Deactivate",
  },
  newService: {
    metaTitle: "New service",
    title: "Add a service",
    subtitle: "Describe a service you offer.",
    submit: "Create service",
    fTitle: "Service title",
    fTitlePh: "Guided tour of Daloa",
    city: "City",
    cityPh: "Daloa",
    price: "Price from (CFA francs)",
    duration: "Duration",
    durationPh: "Half a day",
    description: "Description",
    descriptionPh: "What the service includes…",
  },
  menu: {
    metaTitle: "My menu",
    title: "My menu",
    subtitle: "Showcase your dishes and set menus with a photo and price. Travellers will see them on your page.",
    add: "Add a dish",
    editTitle: "Edit dish",
    newTitle: "New dish",
    name: "Dish name",
    namePh: "Attiéké with fish",
    price: "Price (CFA francs)",
    category: "Category",
    photo: "Dish photo",
    description: "Description",
    descriptionPh: "Ingredients, sides…",
    save: "Save",
    addToMenu: "Add to menu",
    confirmDelete: "Delete this dish?",
    deleted: "Dish deleted.",
    emptyTitle: "Your menu is empty",
    emptyText: "Add your dishes with a photo and price to showcase them to travellers.",
    other: "Other",
    makeUnavailable: "Mark as unavailable",
    makeAvailable: "Mark as available",
    visible: "Visible",
    hidden: "Hidden",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    categories: { "Entrées": "Starters", "Plats": "Mains", "Desserts": "Desserts", "Boissons": "Drinks", "Formules": "Set menus" },
  },
  vehicle: {
    metaTitle: "My vehicle",
    title: "My vehicle",
    subtitle: "Details shown to travellers during your transport missions.",
    note: "Up-to-date vehicle details reassure travellers and make it easier to assign transfer missions.",
  },
  vehicleForm: {
    type: "Vehicle type",
    typePh: "Saloon, SUV, minibus, van…",
    brand: "Make / model",
    plate: "Registration number",
    seats: "Number of seats",
    license: "Driving licence",
    licenseHint: "Update your licence if needed.",
    submit: "Save my vehicle",
  },
  profile: {
    metaTitle: "Partner profile",
    title: "Partner profile",
    subtitle: "Your business and personal details.",
    personal: "Personal details",
    business: "Business",
  },
  messages: {
    subtitle: "Chat with the KoraStay team.",
    emptyTitle: "No conversations",
    emptyText: "Contact the KoraStay team with any question about your missions or your profile.",
  },
  onboarding: {
    metaTitle: "Partner setup",
    reviewTitle: "Profile under review",
    reviewText: "Your profile {name} is being verified by the KoraStay team. You can complete your setup as soon as it is approved.",
    backHome: "Back to home",
    title: "Complete your setup",
    subtitle: "Last step before accessing your space: complete your details and attach your documents.",
    basics: "Basic information",
    phone: "Phone",
    whatsapp: "WhatsApp",
    city: "Main city",
    zones: "Areas covered",
    commaHint: "Separated by commas",
    languages: "Languages spoken",
    languagesPh: "French, English, Dioula",
    description: "About your business",
    descriptionPh: "Describe your business, your experience, your strengths…",
    cuisine: "Type of cuisine",
    cuisinePh: "Ivorian, fast food, maquis, fine dining…",
    docs: "Documents",
    docsText: "Your documents remain confidential and are used for verification only.",
    idDoc: "ID document",
    idDocHint: "National ID card, passport or driving licence (image or PDF).",
    cover: "Photo of your premises",
    coverHint: "Image shown to travellers (optional).",
    licenseHint: "Required for drivers.",
    vehicleTitle: "Your vehicle",
    spaceLabel: "{type} space",
    submit: "Complete my setup",
    logout: "Log out",
  },
};
