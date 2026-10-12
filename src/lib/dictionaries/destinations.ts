// ============================================================
// Destinations : liste et fiche ville.
// ============================================================

export interface DestinationsDict {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  accent: string;
  subtitle: string;
  notFound: string;
  residencesIn: string; // {city}
  comingSoon: string; // {city}
  seeAllResidences: string;
  packsIn: string; // {city}
  mapTitle: string;
  exploreStays: string;
}

export const destinationsFr: DestinationsDict = {
  metaTitle: "Destinations",
  metaDescription: "Découvrez les villes où KoraStay vous accueille, de Daloa à Assinie.",
  eyebrow: "Destinations",
  title: "Explorez la Côte d'Ivoire,",
  accent: "ville après ville.",
  subtitle:
    "Des montagnes de Man aux plages d'Assinie, explorez la richesse de l'Afrique de l'Ouest avec des séjours vérifiés.",
  notFound: "Destination",
  residencesIn: "Logements à {city}",
  comingSoon: "De nouveaux logements arrivent bientôt à {city}.",
  seeAllResidences: "Voir tous les logements",
  packsIn: "Packs Découverte à {city}",
  mapTitle: "Sur la carte",
  exploreStays: "Voir les logements",
};

export const destinationsEn: DestinationsDict = {
  metaTitle: "Destinations",
  metaDescription: "Discover the cities where KoraStay welcomes you, from Daloa to Assinie.",
  eyebrow: "Destinations",
  title: "Explore Côte d'Ivoire,",
  accent: "city by city.",
  subtitle:
    "From the mountains of Man to the beaches of Assinie, explore the richness of West Africa with verified stays.",
  notFound: "Destination",
  residencesIn: "Homes in {city}",
  comingSoon: "New homes are coming soon to {city}.",
  seeAllResidences: "See all homes",
  packsIn: "Discovery packs in {city}",
  mapTitle: "On the map",
  exploreStays: "See the homes",
};
