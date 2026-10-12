// ============================================================
// Pages editoriales : a propos, FAQ, contact, charte qualite, Business,
// devenir proprietaire / partenaire, blog, acces refuse, 404.
// Les textes refletent le fonctionnement reel (paiement Mobile Money /
// virement valide par l'equipe, conditions de pack sur chaque fiche...).
// ============================================================

type Item = { title: string; text: string };
type QA = { q: string; a: string };

export interface PagesDict {
  frOnly: string;
  leadForm: { sent: string; select: string };
  legal: { eyebrow: string; updated: string; toc: string };
  about: {
    metaTitle: string; metaDescription: string;
    eyebrow: string; title: string; accent: string; subtitle: string;
    missionTitle: string; missionText: string;
    visionTitle: string; visionText: string;
    valuesEyebrow: string; valuesTitle: string; valuesAccent: string; values: Item[];
    joinTitle: string; joinAccent: string; joinText: string; joinExplore: string; joinHost: string;
  };
  faq: {
    metaTitle: string; metaDescription: string;
    eyebrow: string; title: string; accent: string; subtitle: string;
    sections: { title: string; items: QA[] }[];
    moreTitle: string; moreText: string; moreCta: string;
  };
  contact: {
    metaTitle: string; metaDescription: string;
    eyebrow: string; title: string; accent: string; subtitle: string;
    email: string; phone: string; zone: string; zoneValue: string; hours: string; hoursValue: string;
    formTitle: string; submit: string;
    name: string; namePlaceholder: string; emailPlaceholder: string;
    subject: string; subjectPlaceholder: string; message: string; messagePlaceholder: string;
  };
  quality: {
    metaTitle: string; metaDescription: string;
    eyebrow: string; title: string; accent: string; subtitle: string;
    processTitle: string; process: Item[];
    levelsTitle: string; levels: Item[];
    equipmentTitle: string; equipment: string[];
    badgeTitle: string; badgeText: string;
  };
  business: {
    metaTitle: string; metaDescription: string;
    eyebrow: string; title: string; accent: string; subtitle: string;
    cases: string[];
    quoteTitle: string; quoteDelay: string; submit: string;
    fields: {
      organization: string; organizationPlaceholder: string;
      type: string; typePlaceholder: string; types: { value: string; label: string }[];
      contact: string; contactPlaceholder: string; email: string; emailPlaceholder: string;
      phone: string; city: string; cityPlaceholder: string; teamSize: string;
      needs: string; needsPlaceholder: string;
    };
    benefitsTitle: string; benefitsAccent: string; benefits: Item[];
  };
  owner: {
    metaTitle: string; metaDescription: string;
    eyebrow: string; title: string; accent: string; subtitle: string;
    badge: string;
    formTitle: string; formSubtitle: string;
    readyTitle: string; readyText: string; readyCta: string;
    activateTitle: string; activateText: string; activateCta: string; activateNote: string;
    stepsTitle: string; stepsAccent: string; steps: Item[];
    benefits: Item[];
  };
  partners: {
    metaTitle: string; metaDescription: string;
    eyebrow: string; title: string; accent: string; subtitle: string;
    types: string[];
    benefitsTitle: string; benefits: Item[];
    faqTitle: string; faq: QA[];
    formTitle: string; formSubtitle: string;
    spaceTitle: string; spaceText: string; spaceCta: string;
    staffTitle: string; staffText: string; staffCta: string;
    activateTitle: string; activateText: string; typeLabel: string; typePlaceholder: string; activateCta: string;
    options: { value: string; label: string }[];
  };
  blog: {
    metaTitle: string; metaDescription: string;
    eyebrow: string; title: string; accent: string; subtitle: string;
    emptyTitle: string; emptyText: string; read: string; readShort: string;
    back: string; related: string; notFound: string;
  };
  unauthorized: { title: string; text: string; home: string; support: string };
  notFound: { title: string; text: string; home: string; explore: string };
}

export const pagesFr: PagesDict = {
  frOnly: "",
  leadForm: { sent: "Demande envoyée !", select: "Sélectionner…" },
  legal: { eyebrow: "Document légal", updated: "Dernière mise à jour : {date}", toc: "Sommaire" },
  about: {
    metaTitle: "À propos",
    metaDescription: "KoraStay, la plateforme ouest-africaine de réservation de logements vérifiés et de séjours accompagnés.",
    eyebrow: "À propos",
    title: "La plateforme ouest-africaine",
    accent: "du séjour vérifié.",
    subtitle:
      "KoraStay simplifie la réservation de logements meublés vérifiés et l'organisation de séjours authentiques, professionnels ou touristiques, d'abord en Côte d'Ivoire puis dans toute l'Afrique de l'Ouest.",
    missionTitle: "Notre mission",
    missionText:
      "Offrir aux voyageurs, familles, professionnels, entreprises, touristes locaux et membres de la diaspora une solution simple, sûre et complète pour réserver un hébergement fiable et organiser leur séjour, avec l'appui d'un réseau local de propriétaires, guides, restaurants et transporteurs vérifiés.",
    visionTitle: "Notre vision",
    visionText:
      "Devenir la plateforme de référence en Afrique de l'Ouest pour la réservation de logements meublés vérifiés et l'organisation de séjours touristiques, professionnels ou familiaux avec accompagnement local.",
    valuesEyebrow: "Nos valeurs",
    valuesTitle: "Ce qui nous",
    valuesAccent: "guide.",
    values: [
      { title: "Confiance", text: "Chaque logement vérifié, chaque partenaire sélectionné, chaque promesse tenue." },
      { title: "Ancrage local", text: "Construit pour les réalités des villes ivoiriennes et ouest-africaines." },
      { title: "Exigence", text: "Un standard élevé sur les logements, les packs et le service client." },
      { title: "Proximité", text: "Une assistance humaine avant, pendant et après le séjour." },
    ],
    joinTitle: "Rejoignez",
    joinAccent: "l'aventure KoraStay.",
    joinText: "Voyageur, propriétaire ou partenaire : il y a une place pour vous.",
    joinExplore: "Explorer les logements",
    joinHost: "Devenir propriétaire",
  },
  faq: {
    metaTitle: "FAQ",
    metaDescription: "Questions fréquentes sur KoraStay : réservation, paiement, annulation, logements et packs.",
    eyebrow: "FAQ",
    title: "Questions",
    accent: "fréquentes.",
    subtitle: "Tout ce qu'il faut savoir pour voyager sereinement avec KoraStay.",
    sections: [
      {
        title: "Réservation & paiement",
        items: [
          {
            q: "Comment réserver un logement ?",
            a: "Choisissez une ville et vos dates, sélectionnez un logement puis envoyez votre demande. Pour un séjour de plusieurs nuits, vous pouvez proposer votre prix au propriétaire. Une fois la demande acceptée, vous réglez selon les instructions affichées et notre équipe confirme votre réservation après vérification du paiement.",
          },
          {
            q: "Quels moyens de paiement acceptez-vous ?",
            a: "Wave, Orange Money, MTN MoMo, Moov Money et virement bancaire. Après l'envoi, vous déclarez la référence de la transaction (et une capture si besoin) depuis votre espace.",
          },
          {
            q: "Mon paiement est-il sécurisé ?",
            a: "Chaque paiement est vérifié par l'équipe KoraStay avant la confirmation de la réservation. Vous payez uniquement aux coordonnées affichées sur votre réservation, jamais directement à un tiers.",
          },
        ],
      },
      {
        title: "Annulation & remboursement",
        items: [
          {
            q: "Puis-je annuler ma réservation ?",
            a: "Oui. Pour les logements : remboursement intégral à plus de 72 h de l'arrivée, 50 % entre 24 et 72 h, aucun remboursement à moins de 24 h. Les packs et activités peuvent avoir des conditions spécifiques, indiquées sur leur fiche ; à défaut, la règle générale s'applique.",
          },
          {
            q: "Quand suis-je remboursé ?",
            a: "Le remboursement est effectué sur le moyen de paiement utilisé : sous 48 à 72 h après validation pour le Mobile Money, sous 5 à 10 jours ouvrés pour un virement.",
          },
        ],
      },
      {
        title: "Logements & packs",
        items: [
          {
            q: "Qu'est-ce qu'un logement vérifié ?",
            a: "Un logement contrôlé par notre équipe selon des critères de propreté, de sécurité, d'équipement et de conformité à l'annonce. Il affiche le badge « Vérifié ».",
          },
          {
            q: "Qu'inclut un Pack Découverte ?",
            a: "Un hébergement vérifié, du transport et un guide local pour découvrir une destination sans rien organiser. Le contenu exact (repas, activités, transferts) est détaillé sur chaque fiche pack.",
          },
        ],
      },
      {
        title: "Propriétaires & partenaires",
        items: [
          {
            q: "Comment publier mon logement ?",
            a: "Créez un compte propriétaire depuis la page Devenir propriétaire, puis ajoutez votre bien depuis votre espace. Chaque logement est vérifié par notre équipe avant sa mise en ligne.",
          },
          {
            q: "Comment devenir partenaire ?",
            a: "Guides, chauffeurs, restaurants et prestataires d'activités rejoignent le réseau via la page Partenaires. L'inscription est gratuite ; notre équipe valide votre profil avant l'activation.",
          },
        ],
      },
    ],
    moreTitle: "Vous ne trouvez pas votre réponse ?",
    moreText: "Notre équipe est là pour vous aider.",
    moreCta: "Contacter l'assistance",
  },
  contact: {
    metaTitle: "Contact",
    metaDescription: "Contactez l'équipe KoraStay.",
    eyebrow: "Contact",
    title: "Parlons de",
    accent: "votre séjour.",
    subtitle: "Une question, une demande ? Notre équipe vous répond rapidement.",
    email: "E-mail",
    phone: "Téléphone",
    zone: "Zone",
    zoneValue: "Côte d'Ivoire · Afrique de l'Ouest",
    hours: "Horaires",
    hoursValue: "Lun – Sam, 8 h – 19 h",
    formTitle: "Envoyez-nous un message",
    submit: "Envoyer le message",
    name: "Nom",
    namePlaceholder: "Votre nom",
    emailPlaceholder: "vous@email.com",
    subject: "Sujet",
    subjectPlaceholder: "Objet de votre message",
    message: "Message",
    messagePlaceholder: "Comment pouvons-nous vous aider ?",
  },
  quality: {
    metaTitle: "Charte qualité",
    metaDescription: "Découvrez le processus de vérification KoraStay et les standards de nos logements.",
    eyebrow: "Charte qualité",
    title: "La confiance,",
    accent: "vérifiée à chaque séjour.",
    subtitle:
      "Chaque logement KoraStay est contrôlé selon des standards stricts avant d'obtenir le badge « Vérifié ».",
    processTitle: "Le processus de vérification",
    process: [
      { title: "Soumission du dossier", text: "Le propriétaire fournit photos, description, tarifs et justificatifs." },
      { title: "Examen sous 5 jours", text: "Notre équipe vérifie la conformité, la sécurité et les équipements." },
      { title: "Attribution du niveau", text: "Essentiel, Confort ou Premium selon les critères remplis." },
      { title: "Badge & publication", text: "Le logement obtient le badge KoraStay et devient réservable." },
    ],
    levelsTitle: "Les niveaux de qualité",
    levels: [
      { title: "Essentiel", text: "Équipements de base, propre et fonctionnel." },
      { title: "Confort", text: "Climatisation, Wi-Fi, bonne literie, emplacement central." },
      { title: "Premium", text: "Mobilier moderne, décoration soignée, services inclus." },
    ],
    equipmentTitle: "Équipements obligatoires",
    equipment: [
      "Literie propre, linge lavé entre chaque séjour",
      "Salle de bain fonctionnelle, eau chaude si annoncée",
      "Cuisine équipée : réfrigérateur, plaques, vaisselle",
      "Installation électrique conforme et éclairage suffisant",
      "Ventilation ou climatisation selon le standing",
      "Sécurité : serrure fiable, environnement raisonnable",
      "Nettoyage complet avant chaque arrivée",
      "Wi-Fi recommandé (obligatoire en Confort et Premium)",
    ],
    badgeTitle: "Le badge « Vérifié » KoraStay",
    badgeText:
      "Ce badge garantit qu'un logement a été contrôlé et respecte nos standards de propreté, de sécurité, d'équipement et de conformité. En cas de non-conformité, de réclamation grave ou de photos trompeuses, le logement peut être suspendu.",
  },
  business: {
    metaTitle: "KoraStay Business",
    metaDescription: "Hébergements professionnels fiables et facturables pour vos équipes en mission en Afrique de l'Ouest.",
    eyebrow: "KoraStay Business",
    title: "Des séjours professionnels",
    accent: "fiables et facturables.",
    subtitle:
      "KoraStay accompagne entreprises, ONG, administrations et institutions pour loger leurs équipes en mission partout en Côte d'Ivoire.",
    cases: ["ONG en mission terrain", "Entreprise en déplacement", "Délégation officielle", "Équipe projet"],
    quoteTitle: "Demander un devis",
    quoteDelay: "Réponse sous 48 h ouvrées.",
    submit: "Envoyer la demande",
    fields: {
      organization: "Organisation",
      organizationPlaceholder: "Nom de l'organisation",
      type: "Type",
      typePlaceholder: "Type d'organisation",
      types: [
        { value: "Entreprise", label: "Entreprise" },
        { value: "ONG", label: "ONG" },
        { value: "Administration", label: "Administration" },
        { value: "Institution", label: "Institution" },
      ],
      contact: "Contact",
      contactPlaceholder: "Votre nom",
      email: "E-mail",
      emailPlaceholder: "vous@entreprise.com",
      phone: "Téléphone",
      city: "Ville de mission",
      cityPlaceholder: "Daloa, Man…",
      teamSize: "Taille de l'équipe",
      needs: "Vos besoins",
      needsPlaceholder: "Dates, exigences, budget…",
    },
    benefitsTitle: "Pourquoi choisir",
    benefitsAccent: "KoraStay Business.",
    benefits: [
      { title: "Devis sur mesure", text: "Une proposition adaptée à vos dates, vos volumes et vos missions." },
      { title: "Factures centralisées", text: "Retrouvez les factures de vos séjours dans votre espace entreprise." },
      { title: "Logements adaptés", text: "Wi-Fi, espace de travail, calme et proximité des services." },
      { title: "Gestion d'équipe", text: "Ajoutez vos collaborateurs et centralisez leurs demandes de séjour." },
      { title: "Suivi des demandes", text: "Suivez chaque demande, devis et séjour depuis un seul tableau de bord." },
      { title: "Interlocuteur dédié", text: "Une équipe KoraStay joignable pour organiser vos missions." },
    ],
  },
  owner: {
    metaTitle: "Devenir propriétaire",
    metaDescription: "Créez votre compte propriétaire sur KoraStay, publiez votre logement meublé et gérez votre calendrier.",
    eyebrow: "Espace propriétaire",
    title: "Valorisez votre logement",
    accent: "avec KoraStay.",
    subtitle:
      "Rejoignez le réseau des logements vérifiés et recevez des réservations de voyageurs identifiés, partout en Côte d'Ivoire.",
    badge: "Le badge « Vérifié » rassure les voyageurs et met votre logement en avant.",
    formTitle: "Créer mon compte propriétaire",
    formSubtitle: "Tout commence ici : créez votre compte, puis publiez vos logements.",
    readyTitle: "Votre espace est prêt",
    readyText: "Gérez vos logements, votre calendrier, vos offres et vos revenus depuis votre espace propriétaire.",
    readyCta: "Accéder à mon espace",
    activateTitle: "Activez votre espace propriétaire",
    activateText:
      "Bonjour {name}, votre compte deviendra un compte propriétaire : vous pourrez publier vos logements et recevoir des réservations. Vous gardez le même identifiant.",
    activateCta: "Activer mon espace propriétaire",
    activateNote: "Vous publierez vos biens ensuite ; chaque logement est vérifié avant sa mise en ligne.",
    stepsTitle: "Comment",
    stepsAccent: "ça marche.",
    steps: [
      { title: "Créez votre compte", text: "Quelques informations suffisent pour ouvrir votre espace propriétaire." },
      { title: "Publiez votre logement", text: "Photos, tarifs, équipements et règlement depuis votre espace." },
      { title: "Vérification KoraStay", text: "Notre équipe contrôle le logement et attribue un niveau de qualité." },
      { title: "Recevez des réservations", text: "Gérez calendrier, offres de prix et revenus au même endroit." },
    ],
    benefits: [
      { title: "Plus de visibilité", text: "Une audience de voyageurs qui recherchent des logements fiables." },
      { title: "Gestion simplifiée", text: "Calendrier, tarifs et disponibilités depuis un seul espace." },
      { title: "Revenus suivis", text: "Vos gains, reversements et historique de réservations en un coup d'œil." },
      { title: "Paiements vérifiés", text: "Chaque paiement voyageur est vérifié par KoraStay avant confirmation." },
    ],
  },
  partners: {
    metaTitle: "Devenir partenaire",
    metaDescription: "Rejoignez le réseau KoraStay Partners : guides, transporteurs, restaurants et prestataires d'activités.",
    eyebrow: "KoraStay Partners",
    title: "Rejoignez le réseau",
    accent: "des partenaires locaux.",
    subtitle:
      "Guides, chauffeurs, restaurants et prestataires : développez votre activité avec KoraStay et proposez des expériences authentiques.",
    types: ["Guides touristiques", "Transporteurs", "Restaurants", "Activités & expériences"],
    benefitsTitle: "Les avantages",
    benefits: [
      { title: "Plus de visibilité", text: "Touchez des voyageurs à la recherche d'expériences locales." },
      { title: "Missions & revenus", text: "Recevez des missions et suivez vos revenus depuis votre espace." },
      { title: "Réseau de confiance", text: "Profitez du label KoraStay et de la confiance qu'il inspire." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Comment devenir partenaire ?",
        a: "Créez votre compte en choisissant votre métier. Notre équipe étudie votre profil puis le valide ; vous complétez ensuite vos services et disponibilités.",
      },
      {
        q: "Y a-t-il des frais d'inscription ?",
        a: "Non. L'inscription au réseau KoraStay Partners est gratuite. Une commission s'applique uniquement sur les missions réalisées.",
      },
      {
        q: "Quels documents fournir ?",
        a: "Une pièce d'identité, vos justificatifs d'activité et quelques photos de vos prestations. Les chauffeurs ajoutent leur permis et les informations du véhicule.",
      },
    ],
    formTitle: "Créer mon compte partenaire",
    formSubtitle: "Choisissez votre métier et créez votre compte. Notre équipe valide votre profil.",
    spaceTitle: "Votre espace partenaire",
    spaceText: "Retrouvez vos missions, vos services et vos revenus dans votre espace.",
    spaceCta: "Accéder à mon espace",
    staffTitle: "Gestion des partenaires",
    staffText: "Vérifiez et gérez les partenaires depuis l'administration.",
    staffCta: "Ouvrir l'administration",
    activateTitle: "Activez votre espace partenaire",
    activateText: "Bonjour {name}, choisissez votre métier : votre compte deviendra un compte partenaire.",
    typeLabel: "Type de partenaire",
    typePlaceholder: "Choisir votre activité",
    activateCta: "Activer mon espace partenaire",
    options: [
      { value: "GUIDE", label: "Guide touristique" },
      { value: "TRANSPORT", label: "Chauffeur / Transport" },
      { value: "RESTAURANT", label: "Restaurant" },
      { value: "ACTIVITY", label: "Activité / expérience" },
      { value: "OTHER", label: "Autre prestataire" },
    ],
  },
  blog: {
    metaTitle: "Blog",
    metaDescription: "Conseils de voyage, découvertes et inspirations pour vos séjours en Afrique de l'Ouest avec KoraStay.",
    eyebrow: "Le blog KoraStay",
    title: "Inspirations",
    accent: "& conseils de voyage.",
    subtitle: "Découvertes, bons plans et récits pour explorer l'Afrique de l'Ouest autrement.",
    emptyTitle: "Aucun article",
    emptyText: "Les premiers articles arrivent bientôt.",
    read: "Lire l'article",
    readShort: "Lire",
    back: "Tous les articles",
    related: "À lire aussi",
    notFound: "Article",
  },
  unauthorized: {
    title: "Accès non autorisé",
    text: "Vous n'avez pas les permissions nécessaires pour accéder à cette page. Si vous pensez qu'il s'agit d'une erreur, contactez l'assistance.",
    home: "Retour à l'accueil",
    support: "Contacter l'assistance",
  },
  notFound: {
    title: "Cette page est introuvable",
    text: "Le lien que vous avez suivi n'existe pas ou plus. Reprenons votre voyage depuis le début.",
    home: "Retour à l'accueil",
    explore: "Explorer les logements",
  },
};

export const pagesEn: PagesDict = {
  frOnly: "This document is available in French only.",
  leadForm: { sent: "Request sent!", select: "Select…" },
  legal: { eyebrow: "Legal document", updated: "Last updated: {date}", toc: "Contents" },
  about: {
    metaTitle: "About",
    metaDescription: "KoraStay, the West-African platform for booking verified homes and guided stays.",
    eyebrow: "About",
    title: "The West-African platform",
    accent: "for verified stays.",
    subtitle:
      "KoraStay makes it simple to book verified furnished homes and organise authentic stays, for work or leisure, starting in Côte d'Ivoire and then across West Africa.",
    missionTitle: "Our mission",
    missionText:
      "To give travellers, families, professionals, companies, local tourists and the diaspora a simple, safe and complete way to book reliable accommodation and organise their stay, backed by a local network of vetted hosts, guides, restaurants and drivers.",
    visionTitle: "Our vision",
    visionText:
      "To become West Africa's reference platform for booking verified furnished homes and organising leisure, business or family stays with local support.",
    valuesEyebrow: "Our values",
    valuesTitle: "What",
    valuesAccent: "guides us.",
    values: [
      { title: "Trust", text: "Every home verified, every partner selected, every promise kept." },
      { title: "Local roots", text: "Built for the realities of Ivorian and West-African cities." },
      { title: "High standards", text: "A demanding bar for homes, packs and customer service." },
      { title: "Closeness", text: "Human support before, during and after your stay." },
    ],
    joinTitle: "Join",
    joinAccent: "the KoraStay journey.",
    joinText: "Traveller, host or partner: there is a place for you.",
    joinExplore: "Explore homes",
    joinHost: "Become a host",
  },
  faq: {
    metaTitle: "FAQ",
    metaDescription: "Frequently asked questions about KoraStay: booking, payment, cancellation, homes and packs.",
    eyebrow: "FAQ",
    title: "Frequently asked",
    accent: "questions.",
    subtitle: "Everything you need to know to travel with peace of mind.",
    sections: [
      {
        title: "Booking & payment",
        items: [
          {
            q: "How do I book a home?",
            a: "Pick a city and dates, choose a home and send your request. For stays of several nights you can propose your own price to the host. Once the request is accepted, you pay following the instructions shown and our team confirms your booking after checking the payment.",
          },
          {
            q: "Which payment methods do you accept?",
            a: "Wave, Orange Money, MTN MoMo, Moov Money and bank transfer. After paying, you declare the transaction reference (and a screenshot if needed) from your account.",
          },
          {
            q: "Is my payment safe?",
            a: "Every payment is checked by the KoraStay team before the booking is confirmed. Only pay to the details shown on your booking, never directly to a third party.",
          },
        ],
      },
      {
        title: "Cancellation & refund",
        items: [
          {
            q: "Can I cancel my booking?",
            a: "Yes. For homes: full refund more than 72 h before arrival, 50% between 24 and 72 h, no refund within 24 h. Packs and activities may have specific conditions shown on their page; otherwise the general rule applies.",
          },
          {
            q: "When will I be refunded?",
            a: "Refunds go back to the payment method used: within 48 to 72 h after validation for Mobile Money, within 5 to 10 business days for a bank transfer.",
          },
        ],
      },
      {
        title: "Homes & packs",
        items: [
          {
            q: "What is a verified home?",
            a: "A home checked by our team for cleanliness, safety, amenities and accuracy of the listing. It shows the “Verified” badge.",
          },
          {
            q: "What does a Discovery Pack include?",
            a: "Verified accommodation, transport and a local guide to explore a destination without organising a thing. Exact contents (meals, activities, transfers) are listed on each pack.",
          },
        ],
      },
      {
        title: "Hosts & partners",
        items: [
          {
            q: "How do I list my home?",
            a: "Create a host account from the Become a host page, then add your property from your dashboard. Every home is checked by our team before it goes live.",
          },
          {
            q: "How do I become a partner?",
            a: "Guides, drivers, restaurants and activity providers join through the Partners page. Sign-up is free; our team validates your profile before activation.",
          },
        ],
      },
    ],
    moreTitle: "Can't find your answer?",
    moreText: "Our team is here to help.",
    moreCta: "Contact support",
  },
  contact: {
    metaTitle: "Contact",
    metaDescription: "Get in touch with the KoraStay team.",
    eyebrow: "Contact",
    title: "Let's talk about",
    accent: "your stay.",
    subtitle: "A question or a request? Our team replies quickly.",
    email: "Email",
    phone: "Phone",
    zone: "Area",
    zoneValue: "Côte d'Ivoire · West Africa",
    hours: "Hours",
    hoursValue: "Mon – Sat, 8 am – 7 pm",
    formTitle: "Send us a message",
    submit: "Send message",
    name: "Name",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@email.com",
    subject: "Subject",
    subjectPlaceholder: "What is it about?",
    message: "Message",
    messagePlaceholder: "How can we help?",
  },
  quality: {
    metaTitle: "Quality charter",
    metaDescription: "Discover KoraStay's verification process and the standards of our homes.",
    eyebrow: "Quality charter",
    title: "Trust,",
    accent: "verified for every stay.",
    subtitle: "Every KoraStay home is checked against strict standards before it earns the “Verified” badge.",
    processTitle: "The verification process",
    process: [
      { title: "Listing submitted", text: "The host provides photos, description, prices and supporting documents." },
      { title: "Review within 5 days", text: "Our team checks compliance, safety and amenities." },
      { title: "Level assigned", text: "Essential, Comfort or Premium depending on the criteria met." },
      { title: "Badge & go-live", text: "The home receives the KoraStay badge and becomes bookable." },
    ],
    levelsTitle: "Quality levels",
    levels: [
      { title: "Essential", text: "Basic amenities, clean and functional." },
      { title: "Comfort", text: "Air conditioning, Wi-Fi, good bedding, central location." },
      { title: "Premium", text: "Modern furniture, careful decoration, services included." },
    ],
    equipmentTitle: "Mandatory amenities",
    equipment: [
      "Clean bedding, linen washed between every stay",
      "Working bathroom, hot water if advertised",
      "Equipped kitchen: fridge, hob, tableware",
      "Compliant electrical installation and good lighting",
      "Ventilation or air conditioning depending on level",
      "Safety: reliable lock, reasonable surroundings",
      "Full cleaning before every arrival",
      "Wi-Fi recommended (mandatory for Comfort and Premium)",
    ],
    badgeTitle: "The KoraStay “Verified” badge",
    badgeText:
      "This badge guarantees that a home has been checked and meets our standards of cleanliness, safety, amenities and accuracy. In case of non-compliance, a serious complaint or misleading photos, the home can be suspended.",
  },
  business: {
    metaTitle: "KoraStay Business",
    metaDescription: "Reliable, invoiceable accommodation for your teams on assignment in West Africa.",
    eyebrow: "KoraStay Business",
    title: "Business stays,",
    accent: "reliable and invoiceable.",
    subtitle:
      "KoraStay supports companies, NGOs, public bodies and institutions in housing their teams on assignment across Côte d'Ivoire.",
    cases: ["NGO field mission", "Business travel", "Official delegation", "Project team"],
    quoteTitle: "Request a quote",
    quoteDelay: "Reply within 48 business hours.",
    submit: "Send request",
    fields: {
      organization: "Organisation",
      organizationPlaceholder: "Organisation name",
      type: "Type",
      typePlaceholder: "Type of organisation",
      types: [
        { value: "Entreprise", label: "Company" },
        { value: "ONG", label: "NGO" },
        { value: "Administration", label: "Public body" },
        { value: "Institution", label: "Institution" },
      ],
      contact: "Contact",
      contactPlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@company.com",
      phone: "Phone",
      city: "Mission city",
      cityPlaceholder: "Daloa, Man…",
      teamSize: "Team size",
      needs: "Your needs",
      needsPlaceholder: "Dates, requirements, budget…",
    },
    benefitsTitle: "Why choose",
    benefitsAccent: "KoraStay Business.",
    benefits: [
      { title: "Tailored quotes", text: "A proposal matched to your dates, volumes and assignments." },
      { title: "Centralised invoices", text: "Find every stay's invoice in your company dashboard." },
      { title: "Work-ready homes", text: "Wi-Fi, a workspace, quiet surroundings and nearby services." },
      { title: "Team management", text: "Add colleagues and centralise their stay requests." },
      { title: "Request tracking", text: "Follow every request, quote and stay from one dashboard." },
      { title: "Dedicated contact", text: "A KoraStay team you can reach to organise your missions." },
    ],
  },
  owner: {
    metaTitle: "Become a host",
    metaDescription: "Create your host account on KoraStay, list your furnished home and manage your calendar.",
    eyebrow: "Host space",
    title: "Make the most of your home",
    accent: "with KoraStay.",
    subtitle: "Join the network of verified homes and receive bookings from identified travellers across Côte d'Ivoire.",
    badge: "The “Verified” badge reassures travellers and puts your home forward.",
    formTitle: "Create my host account",
    formSubtitle: "It all starts here: create your account, then list your homes.",
    readyTitle: "Your space is ready",
    readyText: "Manage your homes, calendar, offers and income from your host dashboard.",
    readyCta: "Go to my dashboard",
    activateTitle: "Activate your host space",
    activateText:
      "Hello {name}, your account will become a host account: you will be able to list homes and receive bookings. You keep the same login.",
    activateCta: "Activate my host space",
    activateNote: "You will list your properties next; every home is checked before going live.",
    stepsTitle: "How it",
    stepsAccent: "works.",
    steps: [
      { title: "Create your account", text: "A few details are enough to open your host space." },
      { title: "List your home", text: "Photos, prices, amenities and house rules from your dashboard." },
      { title: "KoraStay check", text: "Our team inspects the home and assigns a quality level." },
      { title: "Receive bookings", text: "Manage calendar, price offers and income in one place." },
    ],
    benefits: [
      { title: "More visibility", text: "An audience of travellers looking for reliable homes." },
      { title: "Simple management", text: "Calendar, prices and availability from a single space." },
      { title: "Tracked income", text: "Your earnings, payouts and booking history at a glance." },
      { title: "Verified payments", text: "Every traveller payment is checked by KoraStay before confirmation." },
    ],
  },
  partners: {
    metaTitle: "Become a partner",
    metaDescription: "Join the KoraStay Partners network: guides, drivers, restaurants and activity providers.",
    eyebrow: "KoraStay Partners",
    title: "Join the network",
    accent: "of local partners.",
    subtitle: "Guides, drivers, restaurants and providers: grow your business with KoraStay and offer authentic experiences.",
    types: ["Tour guides", "Drivers", "Restaurants", "Activities & experiences"],
    benefitsTitle: "The benefits",
    benefits: [
      { title: "More visibility", text: "Reach travellers looking for local experiences." },
      { title: "Missions & income", text: "Receive missions and track your income from your dashboard." },
      { title: "A trusted network", text: "Benefit from the KoraStay label and the trust it inspires." },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "How do I become a partner?",
        a: "Create your account and choose your trade. Our team reviews and validates your profile; you then complete your services and availability.",
      },
      {
        q: "Are there sign-up fees?",
        a: "No. Joining KoraStay Partners is free. A commission applies only to completed missions.",
      },
      {
        q: "Which documents are needed?",
        a: "An ID document, proof of activity and a few photos of your services. Drivers also add their licence and vehicle details.",
      },
    ],
    formTitle: "Create my partner account",
    formSubtitle: "Choose your trade and create your account. Our team validates your profile.",
    spaceTitle: "Your partner space",
    spaceText: "Find your missions, services and income in your dashboard.",
    spaceCta: "Go to my dashboard",
    staffTitle: "Partner management",
    staffText: "Review and manage partners from the admin area.",
    staffCta: "Open admin",
    activateTitle: "Activate your partner space",
    activateText: "Hello {name}, choose your trade: your account will become a partner account.",
    typeLabel: "Partner type",
    typePlaceholder: "Choose your activity",
    activateCta: "Activate my partner space",
    options: [
      { value: "GUIDE", label: "Tour guide" },
      { value: "TRANSPORT", label: "Driver / Transport" },
      { value: "RESTAURANT", label: "Restaurant" },
      { value: "ACTIVITY", label: "Activity / experience" },
      { value: "OTHER", label: "Other provider" },
    ],
  },
  blog: {
    metaTitle: "Blog",
    metaDescription: "Travel tips, discoveries and inspiration for your stays in West Africa with KoraStay.",
    eyebrow: "The KoraStay blog",
    title: "Inspiration",
    accent: "& travel tips.",
    subtitle: "Discoveries, good deals and stories to explore West Africa differently.",
    emptyTitle: "No articles yet",
    emptyText: "The first articles are coming soon.",
    read: "Read the article",
    readShort: "Read",
    back: "All articles",
    related: "Read next",
    notFound: "Article",
  },
  unauthorized: {
    title: "Access denied",
    text: "You don't have permission to view this page. If you think this is a mistake, contact support.",
    home: "Back to home",
    support: "Contact support",
  },
  notFound: {
    title: "This page can't be found",
    text: "The link you followed doesn't exist or no longer exists. Let's restart your journey from the beginning.",
    home: "Back to home",
    explore: "Explore homes",
  },
};
