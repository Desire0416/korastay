// ============================================================
// Espace proprietaire (/owner) : pages + composants dedies
// (formulaire de residence, calendrier, offres, photos...).
// Le formulaire et le gestionnaire de photos servent aussi a l'admin.
// ============================================================

export interface DashOwnerDict {
  home: {
    metaTitle: string; subtitle: string; addResidence: string;
    kpiPublished: string; kpiPending: string; kpiPendingHint: string; kpiBookings: string; kpiRevenue: string;
    recent: string; emptyTitle: string; emptyText: string;
  };
  table: { reference: string; residence: string; traveler: string; dates: string; status: string; amount: string; date: string; yourShare: string };
  bookings: {
    metaTitle: string; title: string; subtitle: string; searchPlaceholder: string; allStatuses: string;
    emptyTitle: string; emptyText: string; noResultText: string;
  };
  booking: {
    back: string; toApproveTitle: string; toApproveText: string;
    stay: string; persons: string; traveler: string; contact: string; subject: string;
    payment: string; subtotal: string; cleaningFee: string; serviceFee: string; totalPaid: string; paymentStatus: string;
  };
  offers: {
    metaTitle: string; title: string; subtitle: string; emptyTitle: string; emptyText: string;
    awaitingYou: string; awaitingTraveler: string; travelerLabel: string; persons: string;
    history: string; travelerProposed: string; youProposed: string; referencePrice: string;
    expired: string; leftHm: string; leftM: string;
  };
  offerPanel: {
    error: string; failed: string; accepted: string; rejected: string; countered: string;
    acceptedLabel: string; rejectedLabel: string; counteredLabel: string; waitingTraveler: string;
    yourCounter: string; messagePlaceholder: string; sendCounter: string; rejectReason: string;
    rejectPlaceholder: string; confirmReject: string; accept: string; counter: string; reject: string;
  };
  calendar: { metaTitle: string; title: string; subtitle: string; emptyTitle: string; emptyText: string };
  availability: {
    selectPeriod: string; blocked: string; blockTitle: string; reason: string; reasonPlaceholder: string;
    defaultReason: string; block: string; bookedNote: string; confirmedTitle: string; noUpcoming: string;
    blockedTitle: string; noBlocks: string; removeBlock: string;
  };
  revenues: {
    metaTitle: string; title: string; subtitle: string; total: string; bookings: string; average: string;
    detail: string; emptyTitle: string; emptyText: string;
  };
  reviews: { metaTitle: string; title: string; subtitle: string; emptyTitle: string; emptyText: string };
  reviewReply: { published: string; yourReply: string; edit: string; reply: string; placeholder: string; publish: string };
  profile: { metaTitle: string; title: string; subtitle: string; info: string; password: string };
  messages: { subtitle: string; emptyTitle: string; emptyText: string };
  residences: {
    metaTitle: string; title: string; subtitle: string; add: string; searchPlaceholder: string; allStatuses: string;
    emptyTitle: string; emptyText: string; noResultTitle: string; noResultText: string;
    bedroomsShort: string; reviewsCount: string; bookingOne: string; bookingMany: string; perNight: string; manage: string;
  };
  residence: {
    edit: string; photos: string; created: string; features: string; guests: string; bedrooms: string; baths: string;
    description: string; status: string; pricePerNight: string; manageCalendar: string; viewPublic: string;
  };
  publish: { publish: string; unpublish: string; updated: string };
  newResidence: { metaTitle: string; title: string; subtitle: string; crumb: string; submit: string };
  editResidence: { metaTitle: string; title: string; crumb: string; submit: string };
  photosPage: { metaTitle: string; title: string; subtitle: string };
  photos: {
    deleted: string; coverUpdated: string; uploadFailed: string; added: string; uploading: string; add: string;
    hint: string; cover: string; setCover: string; delete: string;
  };
  approve: { approved: string; declined: string; approve: string; decline: string; confirmDecline: string };
  form: {
    adminSection: string; owner: string; selectOwner: string; status: string; statusHint: string;
    statusPublished: string; statusPending: string; statusUnpublished: string;
    general: string; name: string; namePh: string; type: string; city: string; cityPh: string;
    district: string; districtPh: string; address: string; addressPh: string; description: string; descriptionPh: string;
    capacitySection: string; capacity: string; bedrooms: string; beds: string; bathrooms: string;
    pricing: string; price: string; cleaning: string; deposit: string;
    cautionSection: string; cautionEnabled: string; cautionEnabledHint: string;
    cautionJustification: string; cautionJustificationHint: string; cautionJustificationPh: string;
    highDemand: string; highDemandHint: string;
    schedule: string; checkIn: string; checkOut: string; rules: string; rulesPh: string;
    amenities: string; adminNote: string; ownerNote: string;
  };
}

export const dashOwnerFr: DashOwnerDict = {
  home: {
    metaTitle: "Tableau de bord propriétaire",
    subtitle: "Pilotez vos résidences, vos réservations et vos revenus.",
    addResidence: "Ajouter une résidence",
    kpiPublished: "Résidences publiées",
    kpiPending: "En attente",
    kpiPendingHint: "Validation KoraStay",
    kpiBookings: "Réservations",
    kpiRevenue: "Revenus",
    recent: "Réservations récentes",
    emptyTitle: "Aucune réservation",
    emptyText: "Vos réservations apparaîtront ici une fois vos résidences publiées.",
  },
  table: {
    reference: "Référence",
    residence: "Résidence",
    traveler: "Voyageur",
    dates: "Dates",
    status: "Statut",
    amount: "Montant",
    date: "Date",
    yourShare: "Votre part",
  },
  bookings: {
    metaTitle: "Réservations reçues",
    title: "Réservations reçues",
    subtitle: "Toutes les réservations de vos résidences.",
    searchPlaceholder: "Référence, résidence, voyageur…",
    allStatuses: "Tous les statuts",
    emptyTitle: "Aucune réservation",
    emptyText: "Les réservations de vos résidences apparaîtront ici.",
    noResultText: "Aucun résultat pour ces critères.",
  },
  booking: {
    back: "Réservations",
    toApproveTitle: "Demande à valider",
    toApproveText: "Le voyageur attend votre validation. Il réglera ensuite un acompte de {amount}. Sans réponse à temps, la demande est annulée automatiquement.",
    stay: "Séjour",
    persons: "{n} voyageur(s)",
    traveler: "Voyageur",
    contact: "Contacter le voyageur",
    subject: "Réservation {ref}",
    payment: "Paiement",
    subtotal: "Sous-total (votre part)",
    cleaningFee: "Frais de ménage",
    serviceFee: "Frais de service KoraStay",
    totalPaid: "Total payé par le voyageur",
    paymentStatus: "Statut du paiement",
  },
  offers: {
    metaTitle: "Offres de prix reçues",
    title: "Offres de prix reçues",
    subtitle: "Négociez librement le prix avec vos voyageurs.",
    emptyTitle: "Aucune offre en cours",
    emptyText: "Les offres de prix proposées par les voyageurs pour vos résidences apparaîtront ici.",
    awaitingYou: "En attente de votre réponse",
    awaitingTraveler: "Contre-offres envoyées — en attente du voyageur",
    travelerLabel: "Voyageur",
    persons: "{n} voyageur(s)",
    history: "Historique",
    travelerProposed: "Le voyageur a proposé",
    youProposed: "Vous avez proposé",
    referencePrice: "Prix de référence : {price} × {n} = {total}",
    expired: "Expirée",
    leftHm: "{h} h {m} min restantes",
    leftM: "{m} min restantes",
  },
  offerPanel: {
    error: "Erreur lors de l'opération.",
    failed: "Une erreur est survenue. Veuillez réessayer.",
    accepted: "Offre acceptée ! La réservation passe en attente de confirmation.",
    rejected: "Offre refusée. Le voyageur a été notifié.",
    countered: "Contre-offre envoyée. Le voyageur a 24 h pour répondre.",
    acceptedLabel: "Offre acceptée",
    rejectedLabel: "Offre refusée",
    counteredLabel: "Contre-offre envoyée",
    waitingTraveler: "En attente de la réponse du voyageur — contre-offre de {amount} envoyée.",
    yourCounter: "Votre contre-offre",
    messagePlaceholder: "Message au voyageur (optionnel)…",
    sendCounter: "Envoyer la contre-offre",
    rejectReason: "Motif du refus (optionnel)",
    rejectPlaceholder: "Indiquez un motif pour aider le voyageur…",
    confirmReject: "Confirmer le refus",
    accept: "Accepter {amount}",
    counter: "Contre-proposer",
    reject: "Refuser",
  },
  calendar: {
    metaTitle: "Calendrier",
    title: "Calendrier & disponibilités",
    subtitle: "Bloquez des périodes et visualisez vos réservations.",
    emptyTitle: "Aucune résidence",
    emptyText: "Ajoutez une résidence pour gérer son calendrier.",
  },
  availability: {
    selectPeriod: "Sélectionnez une période.",
    blocked: "Période bloquée.",
    blockTitle: "Bloquer une période",
    reason: "Motif (optionnel)",
    reasonPlaceholder: "Maintenance, usage personnel…",
    defaultReason: "Indisponible",
    block: "Bloquer ces dates",
    bookedNote: "Les dates réservées par des voyageurs ne peuvent pas être débloquées ici.",
    confirmedTitle: "Réservations confirmées",
    noUpcoming: "Aucune réservation à venir.",
    blockedTitle: "Périodes bloquées",
    noBlocks: "Aucun blocage manuel.",
    removeBlock: "Supprimer le blocage",
  },
  revenues: {
    metaTitle: "Revenus",
    title: "Revenus",
    subtitle: "Suivez vos gains (hors frais de service KoraStay).",
    total: "Revenu total",
    bookings: "Réservations",
    average: "Panier moyen",
    detail: "Détail des revenus",
    emptyTitle: "Aucun revenu",
    emptyText: "Vos revenus apparaîtront ici après vos premières réservations confirmées.",
  },
  reviews: {
    metaTitle: "Avis reçus",
    title: "Avis reçus",
    subtitle: "Les retours de vos voyageurs, et vos réponses.",
    emptyTitle: "Aucun avis",
    emptyText: "Les avis de vos voyageurs apparaîtront ici après leurs séjours.",
  },
  reviewReply: {
    published: "Réponse publiée.",
    yourReply: "Votre réponse",
    edit: "Modifier",
    reply: "Répondre",
    placeholder: "Répondez à ce voyageur…",
    publish: "Publier la réponse",
  },
  profile: {
    metaTitle: "Mon profil propriétaire",
    title: "Mon profil",
    subtitle: "Gérez vos informations et votre sécurité.",
    info: "Informations",
    password: "Mot de passe",
  },
  messages: {
    subtitle: "Échangez avec vos voyageurs et l'assistance KoraStay.",
    emptyTitle: "Aucune conversation",
    emptyText: "Contactez un voyageur depuis une réservation, ou l'assistance KoraStay.",
  },
  residences: {
    metaTitle: "Mes résidences",
    title: "Mes résidences",
    subtitle: "Gérez vos logements, leurs tarifs et leur disponibilité.",
    add: "Ajouter",
    searchPlaceholder: "Nom, ville…",
    allStatuses: "Tous les statuts",
    emptyTitle: "Aucune résidence",
    emptyText: "Ajoutez votre première résidence pour commencer à recevoir des réservations.",
    noResultTitle: "Aucun résultat",
    noResultText: "Aucune résidence ne correspond à ces critères.",
    bedroomsShort: "{n} ch.",
    reviewsCount: "{n} avis",
    bookingOne: "{n} réservation",
    bookingMany: "{n} réservations",
    perNight: "/nuit",
    manage: "Gérer",
  },
  residence: {
    edit: "Modifier",
    photos: "Photos",
    created: "Résidence créée ! Elle est en attente de validation par l'équipe KoraStay.",
    features: "Caractéristiques",
    guests: "{n} voyageurs",
    bedrooms: "{n} chambres",
    baths: "{n} sdb",
    description: "Description",
    status: "Statut",
    pricePerNight: "Prix par nuit",
    manageCalendar: "Gérer le calendrier",
    viewPublic: "Voir la fiche publique",
  },
  publish: { publish: "Publier", unpublish: "Dépublier", updated: "Mis à jour." },
  newResidence: {
    metaTitle: "Nouvelle résidence",
    title: "Ajouter une résidence",
    subtitle: "Renseignez les informations de votre logement. Il sera soumis à validation.",
    crumb: "Nouvelle",
    submit: "Créer la résidence",
  },
  editResidence: {
    metaTitle: "Modifier la résidence",
    title: "Modifier la résidence",
    crumb: "Modifier",
    submit: "Enregistrer les modifications",
  },
  photosPage: {
    metaTitle: "Photos de la résidence",
    title: "Photos",
    subtitle: "Ajoutez au moins 5 photos de qualité. La photo de couverture est mise en avant.",
  },
  photos: {
    deleted: "Photo supprimée.",
    coverUpdated: "Photo de couverture mise à jour.",
    uploadFailed: "Échec de l'envoi.",
    added: "Photos ajoutées.",
    uploading: "Envoi en cours…",
    add: "Ajouter des photos",
    hint: "JPG, PNG ou WebP · 6 Mo max. Cliquez pour sélectionner.",
    cover: "Couverture",
    setCover: "Définir en couverture",
    delete: "Supprimer",
  },
  approve: {
    approved: "Réservation validée.",
    declined: "Demande déclinée.",
    approve: "Valider la demande",
    decline: "Décliner",
    confirmDecline: "Décliner cette demande de réservation ?",
  },
  form: {
    adminSection: "Attribution (admin)",
    owner: "Propriétaire",
    selectOwner: "Sélectionner un propriétaire",
    status: "Statut",
    statusHint: "Publier rend la résidence visible immédiatement.",
    statusPublished: "Publiée (vérifiée)",
    statusPending: "En attente de validation",
    statusUnpublished: "Dépubliée",
    general: "Informations générales",
    name: "Nom de la résidence",
    namePh: "Lux Résidence Daloa",
    type: "Type de logement",
    city: "Ville",
    cityPh: "Daloa",
    district: "Quartier",
    districtPh: "Lobia 2",
    address: "Adresse",
    addressPh: "Adresse complète (non publique)",
    description: "Description",
    descriptionPh: "Décrivez votre résidence, son ambiance, ses atouts…",
    capacitySection: "Capacité & couchage",
    capacity: "Voyageurs max",
    bedrooms: "Chambres",
    beds: "Lits",
    bathrooms: "Salles de bain",
    pricing: "Tarifs (F CFA)",
    price: "Prix par nuit",
    cleaning: "Frais de ménage",
    deposit: "Montant de la caution",
    cautionSection: "Caution & demande",
    cautionEnabled: "Exiger une caution (dépôt de garantie)",
    cautionEnabledHint: "Le montant ci-dessus pourra être bloqué puis restitué au départ.",
    cautionJustification: "Justification de la caution",
    cautionJustificationHint: "Affichée au voyageur (ex. : objets de valeur, équipements fragiles).",
    cautionJustificationPh: "Ex. : protection des équipements",
    highDemand: "Résidence à forte demande",
    highDemandHint: "Paiement de 100 % exigé à la réservation (selon les règles de paiement).",
    schedule: "Arrivée & départ",
    checkIn: "Heure d'arrivée",
    checkOut: "Heure de départ",
    rules: "Règlement intérieur",
    rulesPh: "Non-fumeur, pas de fêtes, respect du voisinage…",
    amenities: "Équipements",
    adminNote: "Vous gérez cette résidence en tant qu'administrateur.",
    ownerNote: "Votre résidence sera soumise à validation KoraStay.",
  },
};

export const dashOwnerEn: DashOwnerDict = {
  home: {
    metaTitle: "Host dashboard",
    subtitle: "Manage your properties, bookings and earnings.",
    addResidence: "Add a property",
    kpiPublished: "Published properties",
    kpiPending: "Pending",
    kpiPendingHint: "KoraStay review",
    kpiBookings: "Bookings",
    kpiRevenue: "Earnings",
    recent: "Recent bookings",
    emptyTitle: "No bookings yet",
    emptyText: "Your bookings will appear here once your properties are published.",
  },
  table: {
    reference: "Reference",
    residence: "Property",
    traveler: "Guest",
    dates: "Dates",
    status: "Status",
    amount: "Amount",
    date: "Date",
    yourShare: "Your share",
  },
  bookings: {
    metaTitle: "Bookings received",
    title: "Bookings received",
    subtitle: "Every booking across your properties.",
    searchPlaceholder: "Reference, property, guest…",
    allStatuses: "All statuses",
    emptyTitle: "No bookings yet",
    emptyText: "Bookings for your properties will appear here.",
    noResultText: "No results match these filters.",
  },
  booking: {
    back: "Bookings",
    toApproveTitle: "Request awaiting approval",
    toApproveText: "The guest is waiting for your approval. They will then pay a deposit of {amount}. Without a timely answer, the request is cancelled automatically.",
    stay: "Stay",
    persons: "{n} guest(s)",
    traveler: "Guest",
    contact: "Message the guest",
    subject: "Booking {ref}",
    payment: "Payment",
    subtotal: "Subtotal (your share)",
    cleaningFee: "Cleaning fee",
    serviceFee: "KoraStay service fee",
    totalPaid: "Total paid by the guest",
    paymentStatus: "Payment status",
  },
  offers: {
    metaTitle: "Price offers received",
    title: "Price offers received",
    subtitle: "Negotiate the price freely with your guests.",
    emptyTitle: "No open offers",
    emptyText: "Price offers made by guests for your properties will appear here.",
    awaitingYou: "Awaiting your answer",
    awaitingTraveler: "Counter-offers sent — awaiting the guest",
    travelerLabel: "Guest",
    persons: "{n} guest(s)",
    history: "History",
    travelerProposed: "Guest offered",
    youProposed: "You offered",
    referencePrice: "Reference price: {price} × {n} = {total}",
    expired: "Expired",
    leftHm: "{h} h {m} min left",
    leftM: "{m} min left",
  },
  offerPanel: {
    error: "The operation failed.",
    failed: "Something went wrong. Please try again.",
    accepted: "Offer accepted! The booking is now awaiting confirmation.",
    rejected: "Offer declined. The guest has been notified.",
    countered: "Counter-offer sent. The guest has 24 h to respond.",
    acceptedLabel: "Offer accepted",
    rejectedLabel: "Offer declined",
    counteredLabel: "Counter-offer sent",
    waitingTraveler: "Waiting for the guest — counter-offer of {amount} sent.",
    yourCounter: "Your counter-offer",
    messagePlaceholder: "Message to the guest (optional)…",
    sendCounter: "Send counter-offer",
    rejectReason: "Reason for declining (optional)",
    rejectPlaceholder: "Give a reason to help the guest…",
    confirmReject: "Confirm decline",
    accept: "Accept {amount}",
    counter: "Counter-offer",
    reject: "Decline",
  },
  calendar: {
    metaTitle: "Calendar",
    title: "Calendar & availability",
    subtitle: "Block out dates and see your bookings at a glance.",
    emptyTitle: "No properties yet",
    emptyText: "Add a property to manage its calendar.",
  },
  availability: {
    selectPeriod: "Select a date range.",
    blocked: "Dates blocked.",
    blockTitle: "Block dates",
    reason: "Reason (optional)",
    reasonPlaceholder: "Maintenance, personal use…",
    defaultReason: "Unavailable",
    block: "Block these dates",
    bookedNote: "Dates booked by guests cannot be unblocked here.",
    confirmedTitle: "Confirmed bookings",
    noUpcoming: "No upcoming bookings.",
    blockedTitle: "Blocked dates",
    noBlocks: "No manual blocks.",
    removeBlock: "Remove block",
  },
  revenues: {
    metaTitle: "Earnings",
    title: "Earnings",
    subtitle: "Track your earnings (excluding KoraStay service fees).",
    total: "Total earnings",
    bookings: "Bookings",
    average: "Average booking",
    detail: "Earnings breakdown",
    emptyTitle: "No earnings yet",
    emptyText: "Your earnings will appear here after your first confirmed bookings.",
  },
  reviews: {
    metaTitle: "Reviews received",
    title: "Reviews received",
    subtitle: "Feedback from your guests, and your replies.",
    emptyTitle: "No reviews yet",
    emptyText: "Your guests' reviews will appear here after their stays.",
  },
  reviewReply: {
    published: "Reply published.",
    yourReply: "Your reply",
    edit: "Edit",
    reply: "Reply",
    placeholder: "Reply to this guest…",
    publish: "Publish reply",
  },
  profile: {
    metaTitle: "My host profile",
    title: "My profile",
    subtitle: "Manage your details and security.",
    info: "Details",
    password: "Password",
  },
  messages: {
    subtitle: "Chat with your guests and KoraStay support.",
    emptyTitle: "No conversations",
    emptyText: "Message a guest from a booking, or contact KoraStay support.",
  },
  residences: {
    metaTitle: "My properties",
    title: "My properties",
    subtitle: "Manage your homes, their rates and availability.",
    add: "Add",
    searchPlaceholder: "Name, city…",
    allStatuses: "All statuses",
    emptyTitle: "No properties yet",
    emptyText: "Add your first property to start receiving bookings.",
    noResultTitle: "No results",
    noResultText: "No property matches these filters.",
    bedroomsShort: "{n} bd",
    reviewsCount: "{n} reviews",
    bookingOne: "{n} booking",
    bookingMany: "{n} bookings",
    perNight: "/night",
    manage: "Manage",
  },
  residence: {
    edit: "Edit",
    photos: "Photos",
    created: "Property created! It is awaiting review by the KoraStay team.",
    features: "Features",
    guests: "{n} guests",
    bedrooms: "{n} bedrooms",
    baths: "{n} bathrooms",
    description: "Description",
    status: "Status",
    pricePerNight: "Price per night",
    manageCalendar: "Manage calendar",
    viewPublic: "View public listing",
  },
  publish: { publish: "Publish", unpublish: "Unpublish", updated: "Updated." },
  newResidence: {
    metaTitle: "New property",
    title: "Add a property",
    subtitle: "Fill in your home's details. It will be submitted for review.",
    crumb: "New",
    submit: "Create property",
  },
  editResidence: {
    metaTitle: "Edit property",
    title: "Edit property",
    crumb: "Edit",
    submit: "Save changes",
  },
  photosPage: {
    metaTitle: "Property photos",
    title: "Photos",
    subtitle: "Add at least 5 good-quality photos. The cover photo is featured first.",
  },
  photos: {
    deleted: "Photo deleted.",
    coverUpdated: "Cover photo updated.",
    uploadFailed: "Upload failed.",
    added: "Photos added.",
    uploading: "Uploading…",
    add: "Add photos",
    hint: "JPG, PNG or WebP · 6 MB max. Click to select.",
    cover: "Cover",
    setCover: "Set as cover",
    delete: "Delete",
  },
  approve: {
    approved: "Booking approved.",
    declined: "Request declined.",
    approve: "Approve request",
    decline: "Decline",
    confirmDecline: "Decline this booking request?",
  },
  form: {
    adminSection: "Assignment (admin)",
    owner: "Host",
    selectOwner: "Select a host",
    status: "Status",
    statusHint: "Publishing makes the property visible immediately.",
    statusPublished: "Published (verified)",
    statusPending: "Awaiting review",
    statusUnpublished: "Unpublished",
    general: "General information",
    name: "Property name",
    namePh: "Lux Résidence Daloa",
    type: "Property type",
    city: "City",
    cityPh: "Daloa",
    district: "Neighbourhood",
    districtPh: "Lobia 2",
    address: "Address",
    addressPh: "Full address (not public)",
    description: "Description",
    descriptionPh: "Describe your property, its atmosphere and strengths…",
    capacitySection: "Capacity & sleeping",
    capacity: "Max guests",
    bedrooms: "Bedrooms",
    beds: "Beds",
    bathrooms: "Bathrooms",
    pricing: "Rates (CFA francs)",
    price: "Price per night",
    cleaning: "Cleaning fee",
    deposit: "Security deposit amount",
    cautionSection: "Deposit & demand",
    cautionEnabled: "Require a security deposit",
    cautionEnabledHint: "The amount above may be held, then returned at check-out.",
    cautionJustification: "Reason for the deposit",
    cautionJustificationHint: "Shown to the guest (e.g. valuables, fragile equipment).",
    cautionJustificationPh: "E.g. protection of equipment",
    highDemand: "High-demand property",
    highDemandHint: "Full payment required at booking (per the payment rules).",
    schedule: "Check-in & check-out",
    checkIn: "Check-in time",
    checkOut: "Check-out time",
    rules: "House rules",
    rulesPh: "No smoking, no parties, respect the neighbours…",
    amenities: "Amenities",
    adminNote: "You are managing this property as an administrator.",
    ownerNote: "Your property will be submitted for KoraStay review.",
  },
};
