/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- Helpers ----------------------------------------------------------------
const img = (seed: string) => `https://picsum.photos/seed/${seed}/1200/900`;
const DAY = 24 * 60 * 60 * 1000;
const now = new Date();
const daysFromNow = (n: number) => new Date(now.getTime() + n * DAY);
const ref = (s: string) => `KS-${s}`;

async function main() {
  console.log("Nettoyage de la base...");
  // Ordre de suppression respectant les dependances
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.partnerMission.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.packProgramActivity.deleteMany();
  await prisma.packProgramDay.deleteMany();
  await prisma.packIncludedItem.deleteMany();
  await prisma.packImage.deleteMany();
  await prisma.pack.deleteMany();
  await prisma.residenceAmenity.deleteMany();
  await prisma.residenceAvailabilityBlock.deleteMany();
  await prisma.residenceImage.deleteMany();
  await prisma.residence.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.partnerService.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.businessMember.deleteMany();
  await prisma.businessRequest.deleteMany();
  await prisma.businessAccount.deleteMany();
  await prisma.contentPage.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);
  const verified = now;

  // --- Utilisateurs ---------------------------------------------------------
  console.log("Creation des utilisateurs...");
  const admin = await prisma.user.create({
    data: {
      firstName: "Awa", lastName: "Konan", email: "admin@korastay.com",
      phone: "+225 07 57 90 88 84", passwordHash, role: "SUPER_ADMIN",
      status: "ACTIVE", emailVerifiedAt: verified, city: "Abidjan",
    },
  });
  const traveler = await prisma.user.create({
    data: {
      firstName: "Marc", lastName: "Yao", email: "traveler@korastay.com",
      phone: "+225 07 01 02 03 04", passwordHash, role: "TRAVELER",
      status: "ACTIVE", emailVerifiedAt: verified, city: "Abidjan",
    },
  });
  const owner = await prisma.user.create({
    data: {
      firstName: "Fatou", lastName: "Diomande", email: "owner@korastay.com",
      phone: "+225 05 06 07 08 09", passwordHash, role: "OWNER",
      status: "ACTIVE", emailVerifiedAt: verified, city: "Daloa",
    },
  });
  const guideUser = await prisma.user.create({
    data: {
      firstName: "Koffi", lastName: "Brou", email: "guide@korastay.com",
      phone: "+225 07 11 22 33 44", passwordHash, role: "PARTNER",
      status: "ACTIVE", emailVerifiedAt: verified, city: "Daloa",
    },
  });
  const transportUser = await prisma.user.create({
    data: {
      firstName: "Ibrahim", lastName: "Toure", email: "transport@korastay.com",
      phone: "+225 07 55 66 77 88", passwordHash, role: "PARTNER",
      status: "ACTIVE", emailVerifiedAt: verified, city: "Daloa",
    },
  });
  const restaurantUser = await prisma.user.create({
    data: {
      firstName: "Aya", lastName: "Kouame", email: "restaurant@korastay.com",
      phone: "+225 07 99 88 77 66", passwordHash, role: "PARTNER",
      status: "ACTIVE", emailVerifiedAt: verified, city: "Daloa",
    },
  });
  const businessUser = await prisma.user.create({
    data: {
      firstName: "Sandrine", lastName: "Ouattara", email: "business@korastay.com",
      phone: "+225 27 20 30 40 50", passwordHash, role: "BUSINESS",
      status: "ACTIVE", emailVerifiedAt: verified, city: "Abidjan",
    },
  });

  // --- Equipements ----------------------------------------------------------
  console.log("Creation des equipements...");
  const amenityData = [
    ["wifi", "WiFi", "Wifi", "Connectivite"],
    ["climatisation", "Climatisation", "Snowflake", "Confort"],
    ["cuisine", "Cuisine equipee", "CookingPot", "Cuisine"],
    ["eau-chaude", "Eau chaude", "Droplets", "Confort"],
    ["parking", "Parking", "Car", "Exterieur"],
    ["television", "Television", "Tv", "Confort"],
    ["petit-dejeuner", "Petit dejeuner", "Coffee", "Services"],
    ["menage", "Menage", "Sparkles", "Services"],
    ["balcon", "Balcon", "Building2", "Exterieur"],
    ["terrasse", "Terrasse", "Trees", "Exterieur"],
    ["securite", "Securite 24/7", "ShieldCheck", "Securite"],
    ["groupe-electrogene", "Groupe electrogene", "Zap", "Confort"],
    ["piscine", "Piscine", "Waves", "Exterieur"],
    ["lave-linge", "Lave-linge", "WashingMachine", "Services"],
    ["bureau", "Espace bureau", "Laptop", "Business"],
    ["ascenseur", "Ascenseur", "ArrowUpDown", "Confort"],
  ];
  const amenities: Record<string, string> = {};
  for (const [slug, name, icon, category] of amenityData) {
    const a = await prisma.amenity.create({
      data: { slug, name, icon, category },
    });
    amenities[slug] = a.id;
  }

  // --- Destinations ---------------------------------------------------------
  console.log("Creation des destinations...");
  const destData = [
    ["Daloa", "daloa", "Haut-Sassandra", 1, "Ville fondatrice de KoraStay, au coeur du Haut-Sassandra. Village des singes, bords de la Sassandra et hospitalite authentique.", 6.877, -6.45],
    ["Man", "man", "Tonkpi", 2, "La cite des dix-huit montagnes : Dent de Man, cascades, pont de lianes et foret luxuriante.", 7.412, -7.553],
    ["Yamoussoukro", "yamoussoukro", "Lacs", 2, "Capitale politique : Basilique Notre-Dame-de-la-Paix, lac aux crocodiles sacres et grands monuments.", 6.827, -5.289],
    ["San-Pedro", "san-pedro", "San-Pedro", 2, "Port dynamique et plages de l'ouest, porte d'entree du Parc national de Tai.", 4.748, -6.636],
    ["Korhogo", "korhogo", "Poro", 3, "Capitale du pays senoufo : artisanat, toiles de Korhogo, village de Waraniene.", 9.458, -5.629],
    ["Bouake", "bouake", "Gbeke", 3, "Deuxieme ville du pays, carrefour economique et culturel du centre.", 7.69, -5.03],
    ["Abengourou", "abengourou", "Indenie-Djuablin", 4, "Nature verdoyante a la frontiere du Ghana, terre de cacao.", 6.729, -3.496],
    ["Grand-Bassam", "grand-bassam", "Lagunes", 5, "Ancienne capitale, quartier historique classe UNESCO et plages de l'Atlantique.", 5.196, -3.738],
    ["Assinie", "assinie", "Sud-Comoe", 5, "Lagune, plages de sable fin et tourisme balneaire entre mer et cocotiers.", 5.13, -3.28],
    ["Abidjan", "abidjan", "Abidjan", 5, "Hub economique de la Cote d'Ivoire, entre lagune Ebrie et quartiers vibrants.", 5.359, -4.008],
  ];
  const dest: Record<string, string> = {};
  for (const [name, slug, region, priority, description, lat, lng] of destData) {
    const d = await prisma.destination.create({
      data: {
        name: name as string, slug: slug as string, region: region as string,
        priority: priority as number, description: description as string,
        latitude: lat as number, longitude: lng as number,
        heroImageUrl: img(`dest-${slug}`), isActive: true,
      },
    });
    dest[slug as string] = d.id;
  }

  // --- Residences -----------------------------------------------------------
  console.log("Creation des residences...");
  type ResSpec = {
    slug: string; name: string; type: string; city: string; citySlug: string;
    district: string; short: string; desc: string; capacity: number;
    bedrooms: number; beds: number; bathrooms: number; price: number;
    cleaning: number; deposit: number; quality: string | null; verified: boolean;
    status: string; rating: number; ratingCount: number; amenitySlugs: string[];
  };
  const residencesSpec: ResSpec[] = [
    {
      slug: "lux-residence-daloa-lobia-2", name: "Lux Residence - Daloa Lobia 2",
      type: "VILLA", city: "Daloa", citySlug: "daloa", district: "Lobia 2",
      short: "Residence fondatrice KoraStay, spacieuse et premium au coeur de Daloa.",
      desc: "Lux Residence est la residence fondatrice de KoraStay a Daloa. Entierement meublee et decoree avec soin, elle offre un cadre premium pour familles, professionnels en mission et voyageurs exigeants. Vaste salon climatise, cuisine entierement equipee, chambres confortables avec literie de qualite, et un service d'accueil personnalise.",
      capacity: 6, bedrooms: 3, beds: 4, bathrooms: 2, price: 45000, cleaning: 8000,
      deposit: 50000, quality: "PREMIUM", verified: true, status: "PUBLISHED",
      rating: 4.9, ratingCount: 27,
      amenitySlugs: ["wifi", "climatisation", "cuisine", "eau-chaude", "parking", "television", "securite", "groupe-electrogene", "terrasse", "menage"],
    },
    {
      slug: "studio-confort-centre-daloa", name: "Studio Confort Centre-ville Daloa",
      type: "STUDIO", city: "Daloa", citySlug: "daloa", district: "Centre-ville",
      short: "Studio moderne et lumineux, ideal court sejour au centre de Daloa.",
      desc: "Un studio compact et fonctionnel, parfaitement situe au centre-ville de Daloa, a proximite des commerces, banques et restaurants. Ideal pour un voyageur seul ou un couple en court sejour. Climatisation, kitchenette equipee et WiFi inclus.",
      capacity: 2, bedrooms: 1, beds: 1, bathrooms: 1, price: 18000, cleaning: 4000,
      deposit: 20000, quality: "COMFORT", verified: true, status: "PUBLISHED",
      rating: 4.6, ratingCount: 14,
      amenitySlugs: ["wifi", "climatisation", "cuisine", "eau-chaude", "television"],
    },
    {
      slug: "appartement-t2-haut-sassandra", name: "Appartement T2 Haut-Sassandra",
      type: "T2", city: "Daloa", citySlug: "daloa", district: "Tazibouo",
      short: "T2 familial avec salon spacieux et cuisine equipee.",
      desc: "Appartement T2 confortable dans le quartier residentiel de Tazibouo. Salon convivial, une chambre avec grand lit, cuisine equipee et balcon. Adapte aux familles et aux sejours de moyenne duree.",
      capacity: 3, bedrooms: 1, beds: 2, bathrooms: 1, price: 25000, cleaning: 5000,
      deposit: 30000, quality: "COMFORT", verified: true, status: "PUBLISHED",
      rating: 4.5, ratingCount: 9,
      amenitySlugs: ["wifi", "climatisation", "cuisine", "eau-chaude", "balcon", "parking"],
    },
    {
      slug: "villa-familiale-daloa", name: "Villa Familiale Daloa",
      type: "VILLA", city: "Daloa", citySlug: "daloa", district: "Gbeufla",
      short: "Grande villa avec jardin, parfaite pour groupes et familles.",
      desc: "Villa spacieuse avec jardin prive, ideale pour les grandes familles et les groupes d'amis. Trois chambres, deux salles de bain, vaste salon, cuisine complete, terrasse et parking securise.",
      capacity: 8, bedrooms: 3, beds: 5, bathrooms: 2, price: 55000, cleaning: 10000,
      deposit: 60000, quality: "PREMIUM", verified: true, status: "PUBLISHED",
      rating: 4.8, ratingCount: 12,
      amenitySlugs: ["wifi", "climatisation", "cuisine", "eau-chaude", "parking", "television", "securite", "terrasse", "groupe-electrogene"],
    },
    {
      slug: "residence-decouverte-man", name: "Residence Decouverte Man",
      type: "T2", city: "Man", citySlug: "man", district: "Libreville",
      short: "Hebergement chaleureux avec vue sur les montagnes de Man.",
      desc: "Au coeur de la cite des dix-huit montagnes, cette residence offre une vue imprenable et un acces facile aux principaux sites : cascade, Dent de Man et pont de lianes. Confort moderne et accueil chaleureux.",
      capacity: 4, bedrooms: 2, beds: 2, bathrooms: 1, price: 30000, cleaning: 6000,
      deposit: 35000, quality: "COMFORT", verified: true, status: "PUBLISHED",
      rating: 4.7, ratingCount: 11,
      amenitySlugs: ["wifi", "climatisation", "cuisine", "eau-chaude", "television", "terrasse"],
    },
    {
      slug: "appartement-business-yamoussoukro", name: "Appartement Business Yamoussoukro",
      type: "T2", city: "Yamoussoukro", citySlug: "yamoussoukro", district: "Habitat",
      short: "Appartement equipe pour professionnels en mission a Yamoussoukro.",
      desc: "Pense pour les professionnels et les missions, cet appartement dispose d'un espace bureau, d'une connexion WiFi fiable et d'un environnement calme. Proche de la Basilique et des institutions.",
      capacity: 3, bedrooms: 1, beds: 2, bathrooms: 1, price: 32000, cleaning: 6000,
      deposit: 35000, quality: "COMFORT", verified: true, status: "PUBLISHED",
      rating: 4.6, ratingCount: 8,
      amenitySlugs: ["wifi", "climatisation", "cuisine", "eau-chaude", "bureau", "television", "parking"],
    },
    {
      slug: "residence-port-san-pedro", name: "Residence Port San-Pedro",
      type: "T3", city: "San-Pedro", citySlug: "san-pedro", district: "Balmer",
      short: "T3 proche du port et des plages de San-Pedro.",
      desc: "Spacieux T3 a proximite du port et des plages de San-Pedro. Deux chambres, grand salon, cuisine equipee et terrasse ensoleillee. Ideal pour familles et sejours balneaires.",
      capacity: 5, bedrooms: 2, beds: 3, bathrooms: 2, price: 38000, cleaning: 7000,
      deposit: 40000, quality: "COMFORT", verified: false, status: "PUBLISHED",
      rating: 4.4, ratingCount: 6,
      amenitySlugs: ["wifi", "climatisation", "cuisine", "eau-chaude", "terrasse", "parking", "television"],
    },
    {
      slug: "maison-premium-korhogo", name: "Maison Premium Korhogo",
      type: "VILLA", city: "Korhogo", citySlug: "korhogo", district: "Soba",
      short: "Maison premium d'inspiration senoufo, calme et raffinee.",
      desc: "Maison premium melant confort moderne et inspiration artisanale senoufo. Trois chambres, grand sejour, cour interieure et decoration soignee. Une base ideale pour decouvrir Korhogo et Waraniene.",
      capacity: 6, bedrooms: 3, beds: 4, bathrooms: 2, price: 42000, cleaning: 8000,
      deposit: 45000, quality: "PREMIUM", verified: true, status: "PUBLISHED",
      rating: 4.8, ratingCount: 10,
      amenitySlugs: ["wifi", "climatisation", "cuisine", "eau-chaude", "parking", "securite", "terrasse", "menage"],
    },
  ];

  const residences: { id: string; slug: string; price: number; cleaning: number; city: string }[] = [];
  for (const r of residencesSpec) {
    const created = await prisma.residence.create({
      data: {
        ownerId: owner.id, cityId: dest[r.citySlug], slug: r.slug, name: r.name,
        type: r.type, shortDescription: r.short, description: r.desc, city: r.city,
        district: r.district, capacity: r.capacity, bedrooms: r.bedrooms,
        beds: r.beds, bathrooms: r.bathrooms, pricePerNight: r.price,
        weekendPrice: Math.round(r.price * 1.15), weeklyPrice: r.price * 6,
        monthlyPrice: r.price * 24, cleaningFee: r.cleaning, depositAmount: r.deposit,
        status: r.status, verificationStatus: r.verified ? "VERIFIED" : "PENDING_REVIEW",
        qualityLevel: r.quality, isVerified: r.verified,
        badgeLabel: r.verified ? "Residence verifiee KoraStay" : null,
        houseRules: "Non fumeur. Pas de fetes ni evenements sans accord prealable. Respect du voisinage entre 22h et 7h. Animaux non admis sauf accord.",
        ratingAverage: r.rating, ratingCount: r.ratingCount,
        publishedAt: r.status === "PUBLISHED" ? now : null,
        images: {
          create: [1, 2, 3, 4, 5].map((n) => ({
            url: img(`${r.slug}-${n}`),
            altText: `${r.name} - photo ${n}`,
            sortOrder: n - 1,
            isCover: n === 1,
          })),
        },
        amenities: {
          create: r.amenitySlugs.map((slug) => ({ amenityId: amenities[slug] })),
        },
      },
    });
    residences.push({ id: created.id, slug: r.slug, price: r.price, cleaning: r.cleaning, city: r.city });
  }

  // Une residence en attente de validation (pour tester le parcours admin)
  await prisma.residence.create({
    data: {
      ownerId: owner.id, cityId: dest["bouake"], slug: "studio-nouveau-bouake",
      name: "Studio Nouveau Bouake", type: "STUDIO",
      shortDescription: "Nouveau studio en attente de validation KoraStay.",
      description: "Studio recemment soumis a la validation de l'equipe KoraStay. En attente de verification qualite.",
      city: "Bouake", district: "Air France", capacity: 2, bedrooms: 1, beds: 1,
      bathrooms: 1, pricePerNight: 16000, cleaningFee: 3000, depositAmount: 15000,
      status: "PENDING_VALIDATION", verificationStatus: "PENDING_REVIEW",
      houseRules: "Non fumeur.",
      images: {
        create: [1, 2, 3].map((n) => ({
          url: img(`bouake-studio-${n}`), altText: `Studio Bouake ${n}`,
          sortOrder: n - 1, isCover: n === 1,
        })),
      },
      amenities: { create: [{ amenityId: amenities["wifi"] }, { amenityId: amenities["climatisation"] }] },
    },
  });

  // --- Packs ----------------------------------------------------------------
  console.log("Creation des packs...");
  async function createPack(spec: {
    slug: string; name: string; subtitle: string; citySlug: string; desc: string;
    price: number; days: number; nights: number; included: [string, string][];
    notIncluded: string[]; program: { title: string; desc: string; acts: [string, string, string][] }[];
  }) {
    return prisma.pack.create({
      data: {
        destinationId: dest[spec.citySlug], slug: spec.slug, name: spec.name,
        subtitle: spec.subtitle, description: spec.desc, durationDays: spec.days,
        durationNights: spec.nights, basePersons: 2, maxPersons: 4, price: spec.price,
        extraPersonPrice: Math.round(spec.price * 0.35), status: "PUBLISHED",
        heroImageUrl: img(`pack-${spec.slug}`),
        meetingPoint: "Point de rendez-vous communique apres reservation.",
        startTime: "08:00", physicalLevel: "Accessible a tous, marche legere.",
        clothingRecommendations: "Tenue legere, chaussures de marche, chapeau, creme solaire.",
        documentsToBring: "Piece d'identite, confirmation de reservation KoraStay.",
        includedText: spec.included.map((i) => i[0]).join(", "),
        notIncludedText: spec.notIncluded.join(", "),
        cancellationPolicy: "Annulation gratuite jusqu'a 7 jours avant le depart. 50% entre 3 et 7 jours. Aucun remboursement a moins de 3 jours.",
        ratingAverage: 4.8, ratingCount: 15,
        images: {
          create: [1, 2, 3, 4].map((n) => ({
            url: img(`pack-${spec.slug}-${n}`), altText: `${spec.name} ${n}`,
            sortOrder: n - 1, isCover: n === 1,
          })),
        },
        includedItems: {
          create: [
            ...spec.included.map(([label, details], i) => ({ label, details, included: true, sortOrder: i })),
            ...spec.notIncluded.map((label, i) => ({ label, included: false, sortOrder: 100 + i })),
          ],
        },
        programDays: {
          create: spec.program.map((day, di) => ({
            dayNumber: di + 1, title: day.title, description: day.desc, sortOrder: di,
            activities: {
              create: day.acts.map(([timeLabel, title, description], ai) => ({
                timeLabel, title, description, sortOrder: ai,
              })),
            },
          })),
        },
      },
    });
  }

  const packDaloa = await createPack({
    slug: "pack-decouverte-daloa", name: "Pack Decouverte Daloa",
    subtitle: "2 jours / 1 nuit - 2 personnes", citySlug: "daloa",
    desc: "Un week-end clE en main pour decouvrir Daloa et le Haut-Sassandra : hebergement verifie, petit dejeuner, taxi prive en ville et guide local francophone certifie KoraStay.",
    price: 100000, days: 2, nights: 1,
    included: [
      ["Hebergement 1 nuit", "Lux Residence ou residence partenaire verifiee"],
      ["Petit dejeuner", "Inclus les 2 matins"],
      ["Taxi prive en ville", "Pendant toute la duree du sejour"],
      ["Guide local francophone", "Certifie KoraStay"],
    ],
    notIncluded: ["Transport aller-retour vers Daloa", "Dejeuners et diners", "Achats personnels"],
    program: [
      { title: "Arrivee & decouverte", desc: "Installation et premieres visites.", acts: [
        ["Matin", "Arrivee et installation", "Accueil a la residence et remise du programme."],
        ["Apres-midi", "Village des singes", "Visite guidee du celebre village des singes de Daloa."],
        ["Soiree", "Bords de la Sassandra", "Coucher de soleil et diner libre au bord du fleuve."],
      ] },
      { title: "Nature & depart", desc: "Sites naturels emblematiques.", acts: [
        ["Matin", "Ile Bambou", "Excursion sur l'ile Bambou."],
        ["Midi", "Roche de l'Elephant", "Decouverte de la roche de l'Elephant."],
        ["Apres-midi", "Pacifik Lodges - Kibouo & depart", "Detente avant le depart."],
      ] },
    ],
  });

  const packMan = await createPack({
    slug: "pack-decouverte-man", name: "Pack Decouverte Man",
    subtitle: "2 jours / 1 nuit - 2 personnes", citySlug: "man",
    desc: "Explorez la cite des dix-huit montagnes : cascade naturelle, foret des singes, Dent de Man et pont de lianes, avec hebergement verifie et guide certifie.",
    price: 120000, days: 2, nights: 1,
    included: [
      ["Hebergement 1 nuit", "Chambre dans une residence verifiee KoraStay a Man"],
      ["Petit dejeuner", "Inclus les 2 matins"],
      ["Taxi prive en ville", "Pendant toute la duree"],
      ["Guide local francophone", "Certifie KoraStay"],
      ["Droits d'entree des sites", "Inclus si prevu"],
    ],
    notIncluded: ["Transport aller-retour vers Man", "Dejeuners et diners", "Achats personnels"],
    program: [
      { title: "Cascade & ville", desc: "Premiere immersion.", acts: [
        ["Matin", "Arrivee et installation", "Accueil et briefing."],
        ["Apres-midi", "Cascade naturelle de Man", "Visite de la cascade."],
        ["Soiree", "Soiree libre", "Decouverte de la ville."],
      ] },
      { title: "Montagnes & lianes", desc: "Les incontournables.", acts: [
        ["Matin", "Foret des singes", "Rencontre avec les singes sacres."],
        ["Midi", "Dent de Man", "Point de vue sur la Dent de Man."],
        ["Apres-midi", "Pont de lianes & depart", "Traversee du pont de lianes."],
      ] },
    ],
  });

  await createPack({
    slug: "pack-decouverte-yamoussoukro", name: "Pack Decouverte Yamoussoukro",
    subtitle: "2 jours / 1 nuit - 2 personnes", citySlug: "yamoussoukro",
    desc: "Basilique Notre-Dame-de-la-Paix, crocodiles sacres, musees et lac : un concentre du patrimoine de la capitale politique.",
    price: 110000, days: 2, nights: 1,
    included: [
      ["Hebergement 1 nuit", "Appartement verifie KoraStay"],
      ["Petit dejeuner", "Inclus"],
      ["Taxi prive", "En ville"],
      ["Guide local", "Francophone certifie"],
    ],
    notIncluded: ["Transport aller-retour", "Repas", "Achats personnels"],
    program: [
      { title: "Patrimoine", desc: "Monuments majeurs.", acts: [
        ["Matin", "Arrivee", "Installation."],
        ["Apres-midi", "Basilique", "Visite de la Basilique."],
      ] },
      { title: "Nature", desc: "Lac et crocodiles.", acts: [
        ["Matin", "Crocodiles sacres", "Observation."],
        ["Apres-midi", "Depart", "Fin du sejour."],
      ] },
    ],
  });

  await createPack({
    slug: "pack-decouverte-san-pedro", name: "Pack Decouverte San-Pedro",
    subtitle: "3 jours / 2 nuits - 2 personnes", citySlug: "san-pedro",
    desc: "Plages, port et nature : decouvrez l'ouest balneaire et la porte du Parc national de Tai.",
    price: 145000, days: 3, nights: 2,
    included: [
      ["Hebergement 2 nuits", "Residence verifiee proche plage"],
      ["Petit dejeuner", "Inclus"],
      ["Transferts", "Aeroport / port"],
      ["Guide local", "Francophone"],
    ],
    notIncluded: ["Transport aller-retour", "Repas hors petit dejeuner", "Activites optionnelles"],
    program: [
      { title: "Plages", desc: "Detente balneaire.", acts: [["Journee", "Plages de San-Pedro", "Farniente."]] },
      { title: "Port & nature", desc: "Decouverte.", acts: [["Matin", "Visite du port", "Tour guide."]] },
      { title: "Depart", desc: "Fin.", acts: [["Matin", "Temps libre & depart", "Derniers achats."]] },
    ],
  });

  await createPack({
    slug: "pack-decouverte-korhogo", name: "Pack Decouverte Korhogo",
    subtitle: "2 jours / 1 nuit - 2 personnes", citySlug: "korhogo",
    desc: "Immersion senoufo : artisanat, toiles de Korhogo, village de Waraniene et reserve naturelle.",
    price: 115000, days: 2, nights: 1,
    included: [
      ["Hebergement 1 nuit", "Maison verifiee KoraStay"],
      ["Petit dejeuner", "Inclus"],
      ["Taxi prive", "En ville"],
      ["Guide local", "Specialiste culture senoufo"],
    ],
    notIncluded: ["Transport aller-retour", "Repas", "Achats artisanaux"],
    program: [
      { title: "Artisanat", desc: "Culture senoufo.", acts: [["Apres-midi", "Waraniene", "Village des tisserands."]] },
      { title: "Nature", desc: "Reserve.", acts: [["Matin", "Reserve & depart", "Decouverte nature."]] },
    ],
  });

  // --- Partenaires ----------------------------------------------------------
  console.log("Creation des partenaires...");
  const guide = await prisma.partnerProfile.create({
    data: {
      userId: guideUser.id, type: "GUIDE", businessName: "Koffi Tours Daloa",
      description: "Guide local francophone certifie, specialiste du Haut-Sassandra.",
      city: "Daloa", zonesCovered: JSON.stringify(["Daloa", "Vavoua", "Issia"]),
      phone: guideUser.phone, whatsapp: guideUser.phone, email: guideUser.email,
      languages: JSON.stringify(["Francais", "Anglais", "Bete"]),
      verificationStatus: "VERIFIED", ratingAverage: 4.9,
      services: {
        create: [
          { title: "Visite guidee Daloa", description: "Demi-journee de visite guidee.", city: "Daloa", priceFrom: 15000, duration: "4 h", isActive: true },
          { title: "Excursion nature", description: "Ile Bambou et roche de l'Elephant.", city: "Daloa", priceFrom: 25000, duration: "Journee", isActive: true },
        ],
      },
    },
  });
  await prisma.partnerProfile.create({
    data: {
      userId: transportUser.id, type: "TRANSPORT", businessName: "Toure Transport Prive",
      description: "Service de taxi prive et transferts pour vos sejours.",
      city: "Daloa", zonesCovered: JSON.stringify(["Daloa", "Man", "Yamoussoukro"]),
      phone: transportUser.phone, whatsapp: transportUser.phone, email: transportUser.email,
      languages: JSON.stringify(["Francais"]), verificationStatus: "VERIFIED", ratingAverage: 4.7,
      services: {
        create: [
          { title: "Taxi prive en ville", description: "A la journee.", city: "Daloa", priceFrom: 20000, duration: "Journee", isActive: true },
          { title: "Transfert intercite", description: "Daloa - Man et autres axes.", city: "Daloa", priceFrom: 45000, duration: "Variable", isActive: true },
        ],
      },
    },
  });
  await prisma.partnerProfile.create({
    data: {
      userId: restaurantUser.id, type: "RESTAURANT", businessName: "Maquis Chez Aya",
      description: "Cuisine ivoirienne authentique, specialites du terroir.",
      city: "Daloa", zonesCovered: JSON.stringify(["Daloa"]),
      phone: restaurantUser.phone, whatsapp: restaurantUser.phone, email: restaurantUser.email,
      languages: JSON.stringify(["Francais"]), verificationStatus: "VERIFIED", ratingAverage: 4.8,
      services: {
        create: [
          { title: "Menu decouverte", description: "Specialites locales pour 2.", city: "Daloa", priceFrom: 12000, duration: "Repas", isActive: true },
        ],
      },
    },
  });
  // Un second guide (Man), un second transport, une activite, un restaurant pending
  await prisma.partnerProfile.create({
    data: {
      userId: (await prisma.user.create({ data: { firstName: "Jean", lastName: "Gba", email: "guide2@korastay.com", passwordHash, role: "PARTNER", status: "ACTIVE", emailVerifiedAt: verified, city: "Man" } })).id,
      type: "GUIDE", businessName: "Man Mountains Guide", description: "Specialiste des montagnes de Man.",
      city: "Man", zonesCovered: JSON.stringify(["Man", "Danane"]), languages: JSON.stringify(["Francais", "Anglais"]),
      verificationStatus: "VERIFIED", ratingAverage: 4.7,
    },
  });
  await prisma.partnerProfile.create({
    data: {
      userId: (await prisma.user.create({ data: { firstName: "Paul", lastName: "Kone", email: "transport2@korastay.com", passwordHash, role: "PARTNER", status: "ACTIVE", emailVerifiedAt: verified, city: "Man" } })).id,
      type: "TRANSPORT", businessName: "Kone Mobility", description: "Transferts dans l'ouest.",
      city: "Man", zonesCovered: JSON.stringify(["Man", "San-Pedro"]), languages: JSON.stringify(["Francais"]),
      verificationStatus: "VERIFIED", ratingAverage: 4.5,
    },
  });
  await prisma.partnerProfile.create({
    data: {
      userId: (await prisma.user.create({ data: { firstName: "Lucie", lastName: "Adjo", email: "activite@korastay.com", passwordHash, role: "PARTNER", status: "ACTIVE", emailVerifiedAt: verified, city: "Assinie" } })).id,
      type: "ACTIVITY", businessName: "Assinie Nautique", description: "Activites nautiques sur la lagune.",
      city: "Assinie", zonesCovered: JSON.stringify(["Assinie", "Grand-Bassam"]), languages: JSON.stringify(["Francais"]),
      verificationStatus: "PENDING_REVIEW", ratingAverage: 0,
      services: { create: [{ title: "Sortie jet-ski", description: "Decouverte de la lagune.", city: "Assinie", priceFrom: 30000, duration: "1 h", isActive: true }] },
    },
  });

  // --- Reservations ---------------------------------------------------------
  console.log("Creation des reservations...");
  const lux = residences[0];
  const studioDaloa = residences[1];
  const villaDaloa = residences[3];

  // 1. Confirmee future (residence)
  const resFuture = await prisma.reservation.create({
    data: {
      reference: ref("260712-AB12"), type: "RESIDENCE", status: "CONFIRMED",
      travelerId: traveler.id, residenceId: lux.id,
      startDate: daysFromNow(20), endDate: daysFromNow(23), nights: 3, adults: 2, children: 0,
      guestName: "Marc Yao", guestEmail: traveler.email, guestPhone: traveler.phone,
      subtotalAmount: lux.price * 3, serviceFeeAmount: Math.round(lux.price * 3 * 0.07),
      cleaningFeeAmount: lux.cleaning, totalAmount: lux.price * 3 + Math.round(lux.price * 3 * 0.07) + lux.cleaning,
      confirmedAt: now,
      payments: { create: { method: "MOCK", status: "PAID", amount: lux.price * 3 + Math.round(lux.price * 3 * 0.07) + lux.cleaning, provider: "mock", providerReference: "MOCK-260712-AB12", paidAt: now } },
    },
  });

  // 2. Passee terminee (residence) - pour avis
  const resPast = await prisma.reservation.create({
    data: {
      reference: ref("260501-CD34"), type: "RESIDENCE", status: "COMPLETED",
      travelerId: traveler.id, residenceId: studioDaloa.id,
      startDate: daysFromNow(-30), endDate: daysFromNow(-27), nights: 3, adults: 1, children: 0,
      guestName: "Marc Yao", guestEmail: traveler.email, guestPhone: traveler.phone,
      subtotalAmount: studioDaloa.price * 3, serviceFeeAmount: Math.round(studioDaloa.price * 3 * 0.07),
      cleaningFeeAmount: studioDaloa.cleaning, totalAmount: studioDaloa.price * 3 + Math.round(studioDaloa.price * 3 * 0.07) + studioDaloa.cleaning,
      confirmedAt: daysFromNow(-35),
      payments: { create: { method: "ORANGE_MONEY", status: "PAID", amount: studioDaloa.price * 3, provider: "mock", paidAt: daysFromNow(-35) } },
    },
  });

  // 3. En attente de paiement (residence)
  await prisma.reservation.create({
    data: {
      reference: ref("260710-EF56"), type: "RESIDENCE", status: "PENDING_PAYMENT",
      travelerId: traveler.id, residenceId: villaDaloa.id,
      startDate: daysFromNow(10), endDate: daysFromNow(12), nights: 2, adults: 4, children: 1,
      guestName: "Marc Yao", guestEmail: traveler.email, guestPhone: traveler.phone,
      subtotalAmount: villaDaloa.price * 2, serviceFeeAmount: Math.round(villaDaloa.price * 2 * 0.07),
      cleaningFeeAmount: villaDaloa.cleaning, totalAmount: villaDaloa.price * 2 + Math.round(villaDaloa.price * 2 * 0.07) + villaDaloa.cleaning,
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
      payments: { create: { method: "MOCK", status: "PENDING", amount: villaDaloa.price * 2, provider: "mock" } },
    },
  });

  // 4. Annulee (residence)
  await prisma.reservation.create({
    data: {
      reference: ref("260420-GH78"), type: "RESIDENCE", status: "CANCELLED",
      travelerId: traveler.id, residenceId: studioDaloa.id,
      startDate: daysFromNow(-50), endDate: daysFromNow(-48), nights: 2, adults: 2, children: 0,
      guestName: "Marc Yao", guestEmail: traveler.email, guestPhone: traveler.phone,
      subtotalAmount: studioDaloa.price * 2, serviceFeeAmount: Math.round(studioDaloa.price * 2 * 0.07),
      cleaningFeeAmount: studioDaloa.cleaning, totalAmount: studioDaloa.price * 2 + Math.round(studioDaloa.price * 2 * 0.07) + studioDaloa.cleaning,
      cancelledAt: daysFromNow(-55),
      payments: { create: { method: "MOCK", status: "REFUNDED", amount: studioDaloa.price * 2, provider: "mock" } },
    },
  });

  // 5. Pack confirmee
  const resPack = await prisma.reservation.create({
    data: {
      reference: ref("260715-IJ90"), type: "PACK", status: "CONFIRMED",
      travelerId: traveler.id, packId: packDaloa.id,
      startDate: daysFromNow(15), endDate: daysFromNow(16), nights: 1, adults: 2, children: 0,
      guestName: "Marc Yao", guestEmail: traveler.email, guestPhone: traveler.phone,
      subtotalAmount: 100000, serviceFeeAmount: 7000, totalAmount: 107000, confirmedAt: now,
      payments: { create: { method: "WAVE", status: "PAID", amount: 107000, provider: "mock", paidAt: now } },
      partnerMissions: {
        create: { partnerProfileId: guide.id, packId: packDaloa.id, title: "Guide - Pack Decouverte Daloa", city: "Daloa", scheduledAt: daysFromNow(15), status: "CONFIRMED", amount: 25000 },
      },
    },
  });

  // --- Avis (lies a la reservation passee) ----------------------------------
  console.log("Creation des avis...");
  await prisma.review.create({
    data: {
      authorId: traveler.id, reservationId: resPast.id, residenceId: studioDaloa.id,
      rating: 5, cleanlinessRating: 5, locationRating: 5, valueRating: 4, communicationRating: 5,
      comment: "Studio impeccable, tres bien situe et proprietaire tres reactif. Je recommande vivement pour un sejour a Daloa !",
    },
  });
  // Avis supplementaires d'autres voyageurs (pour credibilite)
  const reviewers = [
    ["Aminata", "S.", "Sejour parfait, residence conforme aux photos. Accueil chaleureux."],
    ["David", "K.", "Tres bon rapport qualite-prix, propre et bien equipe."],
    ["Chantal", "B.", "Cadre agreable et calme, parfait pour la famille."],
  ];
  for (let i = 0; i < reviewers.length; i++) {
    const [fn, ln, comment] = reviewers[i];
    const u = await prisma.user.create({
      data: { firstName: fn, lastName: ln, email: `reviewer${i}@korastay.com`, passwordHash, role: "TRAVELER", status: "ACTIVE", emailVerifiedAt: verified },
    });
    await prisma.review.create({
      data: { authorId: u.id, residenceId: lux.id, rating: 5 - (i % 2), cleanlinessRating: 5, locationRating: 4, valueRating: 5, communicationRating: 5, comment },
    });
  }

  // --- Favoris --------------------------------------------------------------
  console.log("Creation des favoris...");
  await prisma.favorite.create({ data: { userId: traveler.id, residenceId: villaDaloa.id } });
  await prisma.favorite.create({ data: { userId: traveler.id, residenceId: residences[4].id } });
  await prisma.favorite.create({ data: { userId: traveler.id, packId: packMan.id } });

  // --- Business -------------------------------------------------------------
  console.log("Creation des demandes business...");
  const businessAccount = await prisma.businessAccount.create({
    data: {
      name: "ONG Espoir Plus", organizationType: "ONG", sector: "Developpement",
      contactName: "Sandrine Ouattara", email: businessUser.email, phone: businessUser.phone,
      city: "Abidjan", status: "ACTIVE",
      members: { create: { userId: businessUser.id, role: "OWNER" } },
    },
  });
  await prisma.businessRequest.create({
    data: {
      businessAccountId: businessAccount.id, organizationName: "ONG Espoir Plus",
      organizationType: "ONG", sector: "Developpement", contactName: "Sandrine Ouattara",
      email: businessUser.email, phone: businessUser.phone, city: "Daloa",
      needType: "Hebergement equipe en mission", missionLocation: "Daloa",
      teamSize: 5, startDate: daysFromNow(25), endDate: daysFromNow(32), budget: 1500000,
      notes: "Mission terrain de 5 collaborateurs. Besoin WiFi, calme et facturation entreprise.",
      status: "NEW",
    },
  });
  // Demande business hors compte (prospect)
  await prisma.businessRequest.create({
    data: {
      organizationName: "Entreprise BTP Sahel", organizationType: "Entreprise", sector: "BTP",
      contactName: "Moussa Diallo", email: "moussa@btpsahel.example", phone: "+225 07 00 00 00 00",
      city: "San-Pedro", needType: "Logements chantier", missionLocation: "San-Pedro",
      teamSize: 8, startDate: daysFromNow(40), endDate: daysFromNow(70), budget: 4000000,
      notes: "Logement pour equipe de chantier sur 1 mois.", status: "IN_REVIEW",
    },
  });

  // --- Notifications --------------------------------------------------------
  console.log("Creation des notifications...");
  await prisma.notification.createMany({
    data: [
      { userId: traveler.id, title: "Reservation confirmee", body: `Votre reservation ${resFuture.reference} a Lux Residence est confirmee.`, type: "RESERVATION_CONFIRMED", url: `/account/bookings` },
      { userId: traveler.id, title: "Pack confirme", body: `Votre Pack Decouverte Daloa (${resPack.reference}) est confirme.`, type: "RESERVATION_CONFIRMED", url: `/account/bookings` },
      { userId: traveler.id, title: "Laissez un avis", body: "Comment s'est passe votre sejour au Studio Confort ? Partagez votre avis.", type: "REVIEW_INVITE", url: `/account/reviews`, readAt: null },
      { userId: owner.id, title: "Nouvelle reservation", body: `Nouvelle reservation confirmee a Lux Residence (${resFuture.reference}).`, type: "OWNER_BOOKING", url: `/owner/bookings` },
      { userId: admin.id, title: "Residence en attente", body: "Studio Nouveau Bouake attend une validation.", type: "ADMIN_VALIDATION", url: `/admin/residences` },
    ],
  });

  // --- Conversations de demonstration ---------------------------------------
  console.log("Creation des conversations...");
  const min = (n: number) => new Date(now.getTime() - n * 60000);
  // 1. Voyageur <-> Hote (a propos d'une reservation)
  await prisma.conversation.create({
    data: {
      contextType: "RESERVATION", reservationId: resFuture.id, subject: "Arrivee a Lux Residence",
      createdById: traveler.id, lastMessageAt: min(30),
      participants: { create: [
        { userId: traveler.id, roleLabel: "Voyageur", lastReadAt: min(25) },
        { userId: owner.id, roleLabel: "Hote" },
      ] },
      messages: { create: [
        { senderId: traveler.id, body: "Bonjour, a quelle heure puis-je arriver pour le check-in ?", createdAt: min(40) },
        { senderId: owner.id, body: "Bonjour Marc ! L'arrivee est possible des 14h. Je vous accueille sur place.", createdAt: min(30) },
      ] },
    },
  });
  // 2. Voyageur <-> Assistance (avec note interne)
  await prisma.conversation.create({
    data: {
      contextType: "SUPPORT_TICKET", subject: "Question sur le paiement Wave",
      createdById: traveler.id, lastMessageAt: min(15),
      participants: { create: [
        { userId: traveler.id, roleLabel: "Voyageur" },
        { userId: admin.id, roleLabel: "Assistance KoraStay", lastReadAt: min(10) },
      ] },
      messages: { create: [
        { senderId: traveler.id, body: "Bonjour, puis-je payer ma reservation avec Wave ?", createdAt: min(20) },
        { senderId: admin.id, body: "Bonjour ! Oui, Wave est disponible au moment du paiement, sans frais.", createdAt: min(15) },
        { senderId: admin.id, body: "Client fidele - prioriser la reponse.", isInternal: true, createdAt: min(14) },
      ] },
    },
  });
  // 3. Guide (partenaire) <-> Assistance
  await prisma.conversation.create({
    data: {
      contextType: "SUPPORT_TICKET", subject: "Disponibilite pour le Pack Daloa",
      createdById: guideUser.id, lastMessageAt: min(5),
      participants: { create: [
        { userId: guideUser.id, roleLabel: "Partenaire" },
        { userId: admin.id, roleLabel: "Assistance KoraStay" },
      ] },
      messages: { create: [
        { senderId: guideUser.id, body: "Bonjour, je suis disponible ce week-end pour accompagner le Pack Decouverte Daloa.", createdAt: min(5) },
      ] },
    },
  });

  // --- Pages de contenu (legal) ---------------------------------------------
  console.log("Creation des pages de contenu...");
  const pages: [string, string, string][] = [
    ["conditions-generales", "Conditions generales de reservation", "Les presentes conditions generales regissent l'utilisation de la plateforme KoraStay et les reservations effectuees. En reservant, le voyageur accepte ces conditions. KoraStay agit comme intermediaire entre voyageurs, proprietaires et partenaires verifies."],
    ["politique-annulation", "Politique d'annulation et de remboursement", "Residences : remboursement integral de la nuitee a plus de 72h du check-in, 50% entre 24 et 72h, aucun a moins de 24h. Packs : integral a plus de 7 jours, 50% entre 3 et 7 jours, aucun a moins de 3 jours. Les frais de service ne sont pas remboursables."],
    ["charte-qualite", "Charte qualite KoraStay", "Chaque residence est verifiee selon des standards stricts de proprete, securite, equipement et conformite. Trois niveaux : Essentiel, Confort et Premium. Le badge Residence verifiee KoraStay garantit le respect de ces standards."],
    ["confidentialite", "Politique de confidentialite", "KoraStay protege vos donnees personnelles et respecte vos droits d'acces, de rectification et de suppression. Vos donnees ne sont jamais revendues."],
    ["mentions-legales", "Mentions legales", "KoraStay, plateforme de reservation de residences meublees et de sejours touristiques en Afrique de l'Ouest. Contact : contact@korastay.com."],
    ["conditions-partenaires", "Conditions partenaires", "Les partenaires (proprietaires, guides, transporteurs, restaurants, prestataires) s'engagent a respecter les standards de qualite et de service KoraStay."],
  ];
  for (const [slug, title, body] of pages) {
    await prisma.contentPage.create({
      data: { slug, title, body, seoTitle: `${title} - KoraStay`, seoDescription: body.slice(0, 150), isPublished: true },
    });
  }

  // --- Articles de blog -----------------------------------------------------
  console.log("Creation des articles de blog...");
  const posts: { slug: string; title: string; excerpt: string; body: string; cover: string; days: number }[] = [
    {
      slug: "decouvrir-grand-bassam-week-end",
      title: "Grand-Bassam en un week-end : le guide complet",
      excerpt: "Premiere capitale de la Cote d'Ivoire et site classe UNESCO, Grand-Bassam melange plages, patrimoine colonial et art vivant. Voici notre itineraire ideal sur deux jours.",
      cover: img("bassam-blog"),
      days: 4,
      body: "A seulement 40 minutes d'Abidjan, Grand-Bassam est l'escapade week-end par excellence. Ancienne capitale coloniale classee au patrimoine mondial de l'UNESCO, la ville conjugue plages de sable fin, maisons historiques aux facades patinees et une scene artisanale vibrante.\n\nJour 1 : le quartier France. Commencez par une promenade dans le quartier historique. Les anciennes demeures coloniales, la cathedrale et le Musee national du costume racontent un siecle d'histoire. Profitez-en pour dejeuner dans l'un des maquis en bord de mer : le poisson braise y est incontournable.\n\nJour 2 : detente et artisanat. Reservez votre matinee pour la plage, puis partez a la rencontre des artisans batikiers et sculpteurs. Repartez avec un souvenir unique, fabrique sous vos yeux.\n\nOu loger ? Optez pour une residence KoraStay verifiee a quelques pas de la plage. Nos hotes vous accueillent avec le sens de l'hospitalite ivoirienne, et nos packs Decouverte incluent guide local et transport depuis Abidjan.",
    },
    {
      slug: "5-plats-ivoiriens-a-gouter",
      title: "5 plats ivoiriens a gouter absolument pendant votre sejour",
      excerpt: "Attieke, garba, kedjenou... La cuisine ivoirienne est une fete pour les papilles. Tour d'horizon des saveurs a ne pas manquer lors de votre voyage.",
      cover: img("food-blog"),
      days: 9,
      body: "Voyager en Cote d'Ivoire, c'est aussi un voyage gustatif. Voici cinq specialites a inscrire au menu de votre sejour.\n\n1. L'attieke. Cette semoule de manioc legerement acidulee accompagne poissons et viandes. C'est le plat national par excellence, simple et delicieux.\n\n2. Le garba. Attieke et thon frit, servi avec piment et oignons : le snack populaire des Abidjanais, a deguster dans un kiosque de rue.\n\n3. Le kedjenou. Un poulet ou de la pintade mijotee lentement dans une canari, avec legumes et epices. Tendre et parfume.\n\n4. La sauce graine. A base de noix de palme, riche et onctueuse, servie avec du riz ou du foutou.\n\n5. L'alloco. Bananes plantain frites, croustillantes et sucrees, l'accompagnement ou l'en-cas que tout le monde adore.\n\nNos partenaires restaurateurs verifies vous ouvrent les portes de la gastronomie locale. Composez un pack personnalise et ajoutez une experience culinaire authentique a votre voyage.",
    },
    {
      slug: "voyager-responsable-cote-divoire",
      title: "Voyager responsable en Cote d'Ivoire : nos conseils",
      excerpt: "Soutenir l'economie locale, respecter l'environnement et les communautes : quelques gestes simples pour un voyage qui a du sens.",
      cover: img("responsible-blog"),
      days: 16,
      body: "Le tourisme responsable n'est pas qu'une tendance : c'est une maniere de voyager qui profite a tous. Voici nos recommandations pour un sejour a impact positif.\n\nPrivilegiez le local. En choisissant des hebergements tenus par des proprietaires locaux et des guides de la region, vous soutenez directement l'economie des communautes que vous visitez. Chez KoraStay, chaque partenaire est verifie et remunere equitablement.\n\nReduisez votre empreinte. Limitez le plastique a usage unique, emportez une gourde reutilisable et respectez les espaces naturels, notamment dans les parcs et reserves.\n\nRespectez les cultures. Demandez toujours l'autorisation avant de photographier des personnes, habillez-vous de maniere appropriee selon les lieux et apprenez quelques mots de salutation : un simple bonjour ouvre bien des portes.\n\nConsommez l'artisanat authentique. Acheter directement aux artisans, plutot que des produits importes, valorise les savoir-faire et offre des souvenirs porteurs de sens.\n\nVoyager autrement, c'est possible. Avec KoraStay, composez un sejour qui conjugue decouverte, confort et respect des territoires.",
    },
  ];
  for (const p of posts) {
    await prisma.blogPost.create({
      data: {
        slug: p.slug, title: p.title, excerpt: p.excerpt, body: p.body,
        coverImageUrl: p.cover, authorId: admin.id, isPublished: true,
        publishedAt: daysFromNow(-p.days),
      },
    });
  }

  console.log("\nSeed termine avec succes !");
  console.log("Comptes de demonstration (mot de passe : Password123!) :");
  console.log("  - admin@korastay.com       (Super Admin)");
  console.log("  - traveler@korastay.com    (Voyageur)");
  console.log("  - owner@korastay.com       (Proprietaire)");
  console.log("  - guide@korastay.com       (Partenaire - Guide)");
  console.log("  - business@korastay.com    (Business)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
