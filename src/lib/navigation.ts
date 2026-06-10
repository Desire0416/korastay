// ============================================================
// Configuration de navigation (publique + espaces connectes)
// ============================================================

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
}

export const PUBLIC_NAV: NavItem[] = [
  { label: "Residences", href: "/residences" },
  { label: "Packs Decouverte", href: "/packs" },
  { label: "Destinations", href: "/destinations" },
  { label: "Business", href: "/business" },
];

export const FOOTER_NAV: { title: string; links: NavItem[] }[] = [
  {
    title: "Explorer",
    links: [
      { label: "Residences verifiees", href: "/residences" },
      { label: "Packs Decouverte", href: "/packs" },
      { label: "Destinations", href: "/destinations" },
      { label: "Pack personnalise", href: "/packs/custom" },
    ],
  },
  {
    title: "Rejoindre",
    links: [
      { label: "Devenir proprietaire", href: "/devenir-proprietaire" },
      { label: "Devenir partenaire", href: "/partners" },
      { label: "KoraStay Business", href: "/business" },
    ],
  },
  {
    title: "KoraStay",
    links: [
      { label: "A propos", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Charte qualite", href: "/quality" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Conditions generales", href: "/conditions-generales" },
      { label: "Politique d'annulation", href: "/politique-annulation" },
      { label: "Confidentialite", href: "/confidentialite" },
      { label: "Mentions legales", href: "/mentions-legales" },
    ],
  },
];

// Onglets de la bottom navigation mobile (public / voyageur)
export const MOBILE_TABS: NavItem[] = [
  { label: "Explorer", href: "/", icon: "Search" },
  { label: "Packs", href: "/packs", icon: "Compass" },
  { label: "Favoris", href: "/account/favorites", icon: "Heart" },
  { label: "Sejours", href: "/account/bookings", icon: "CalendarCheck" },
  { label: "Profil", href: "/account", icon: "User" },
];

// Menus des espaces connectes par role
export const ACCOUNT_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/account", icon: "LayoutDashboard" },
  { label: "Mes reservations", href: "/account/bookings", icon: "CalendarCheck" },
  { label: "Favoris", href: "/account/favorites", icon: "Heart" },
  { label: "Mes avis", href: "/account/reviews", icon: "Star" },
  { label: "Packs sur mesure", href: "/account/custom-packs", icon: "Wand2" },
  { label: "Messages", href: "/account/messages", icon: "MessageCircle" },
  { label: "Notifications", href: "/account/notifications", icon: "Bell" },
  { label: "Profil", href: "/account/profile", icon: "User" },
  { label: "Securite", href: "/account/security", icon: "Shield" },
];

export const OWNER_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/owner", icon: "LayoutDashboard" },
  { label: "Mes residences", href: "/owner/residences", icon: "Home" },
  { label: "Calendrier", href: "/owner/calendar", icon: "Calendar" },
  { label: "Reservations", href: "/owner/bookings", icon: "CalendarCheck" },
  { label: "Revenus", href: "/owner/revenues", icon: "Wallet" },
  { label: "Avis", href: "/owner/reviews", icon: "Star" },
  { label: "Messages", href: "/owner/messages", icon: "MessageCircle" },
  { label: "Profil", href: "/owner/profile", icon: "User" },
];

export const PARTNER_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/partner", icon: "LayoutDashboard" },
  { label: "Profil", href: "/partner/profile", icon: "User" },
  { label: "Mes services", href: "/partner/services", icon: "Tags" },
  { label: "Missions", href: "/partner/missions", icon: "Briefcase" },
  { label: "Calendrier", href: "/partner/calendar", icon: "Calendar" },
  { label: "Revenus", href: "/partner/revenues", icon: "Wallet" },
  { label: "Messages", href: "/partner/messages", icon: "MessageCircle" },
];

export const BUSINESS_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/business/dashboard", icon: "LayoutDashboard" },
  { label: "Mes demandes", href: "/business/requests", icon: "FileText" },
  { label: "Equipe", href: "/business/team", icon: "Users" },
  { label: "Factures", href: "/business/invoices", icon: "Receipt" },
  { label: "Profil", href: "/business/profile", icon: "Building2" },
];

export const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Pilotage",
    items: [
      { label: "Tableau de bord", href: "/admin", icon: "LayoutDashboard" },
      { label: "Reservations", href: "/admin/reservations", icon: "CalendarCheck" },
      { label: "Paiements", href: "/admin/payments", icon: "CreditCard" },
      { label: "Remboursements", href: "/admin/refunds", icon: "RotateCcw" },
    ],
  },
  {
    group: "Offre",
    items: [
      { label: "Residences", href: "/admin/residences", icon: "Home" },
      { label: "Packs", href: "/admin/packs", icon: "Compass" },
      { label: "Packs perso", href: "/admin/custom-packs", icon: "Wand2" },
      { label: "Destinations", href: "/admin/destinations", icon: "MapPin" },
      { label: "Avis", href: "/admin/reviews", icon: "Star" },
    ],
  },
  {
    group: "Communaute",
    items: [
      { label: "Utilisateurs", href: "/admin/users", icon: "Users" },
      { label: "Partenaires", href: "/admin/partners", icon: "Handshake" },
      { label: "Business", href: "/admin/business", icon: "Briefcase" },
      { label: "Messages", href: "/admin/messages", icon: "MessageCircle" },
    ],
  },
  {
    group: "Systeme",
    items: [
      { label: "Contenu", href: "/admin/content/pages", icon: "FileText" },
      { label: "Blog", href: "/admin/content/blog", icon: "Newspaper" },
      { label: "Exports", href: "/admin/exports", icon: "Download" },
      { label: "Parametres", href: "/admin/settings", icon: "Settings" },
      { label: "Audit", href: "/admin/audit", icon: "ScrollText" },
    ],
  },
];
