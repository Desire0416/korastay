/* eslint-disable no-console */
// ============================================================
// Restauration des accents francais (e -> é/è/ê, + ç/ô/î surs).
// ------------------------------------------------------------
// Transforme UNIQUEMENT le texte visible : litteraux de chaine et
// texte JSX. Ne touche jamais aux identifiants, slugs, routes,
// valeurs d'enum (MAJUSCULES), noms de modeles Prisma, ni chemins.
//   npx tsx scripts/fix-accents.ts --dry     (rapport, aucune ecriture)
//   npx tsx scripts/fix-accents.ts           (applique)
// ============================================================
import ts from "typescript";
import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "..", "src");
const DRY = process.argv.includes("--dry");

// --- Dictionnaire (forme non accentuee -> accentuee), bases minuscules.
// On n'inclut QUE des mots dont l'accentuation est non ambigue.
const BASE: Record<string, string> = {
  // reservation / sejour
  reservation: "réservation", reservations: "réservations", reserver: "réserver",
  reservez: "réservez", reservee: "réservée", reservees: "réservées",
  // residence
  residence: "résidence", residences: "résidences",
  // verifie
  verifie: "vérifié", verifiee: "vérifiée", verifies: "vérifiés", verifiees: "vérifiées",
  verifier: "vérifier", verifiez: "vérifiez", verification: "vérification",
  // securite
  securite: "sécurité", securisee: "sécurisée", securise: "sécurisé", securises: "sécurisés",
  // decouvrir / decouverte
  decouvrir: "découvrir", decouverte: "découverte", decouvertes: "découvertes", decouvrez: "découvrez",
  // telephone
  telephone: "téléphone", telephones: "téléphones",
  // prefere
  prefere: "préféré", preferee: "préférée", preferes: "préférés",
  // numero
  numero: "numéro", numeros: "numéros",
  // creer / cree / creation
  creer: "créer", cree: "créé", creee: "créée", crees: "créés", creees: "créées",
  creez: "créez", creation: "création", creations: "créations",
  // etape
  etape: "étape", etapes: "étapes",
  // hote / hotel
  hote: "hôte", hotes: "hôtes", hotel: "hôtel", hotels: "hôtels",
  // depart / arrivee
  depart: "départ", departs: "départs", arrivee: "arrivée", arrivees: "arrivées",
  // menage
  menage: "ménage",
  // general
  general: "général", generale: "générale", generales: "générales", generaux: "généraux",
  generalement: "généralement",
  // detail
  detail: "détail", details: "détails", detaillee: "détaillée", detaille: "détaillé",
  // experience
  experience: "expérience", experiences: "expériences",
  // statuts
  confirmee: "confirmée", confirmees: "confirmées", confirme: "confirmé", confirmes: "confirmés",
  confirmer: "confirmer", annulee: "annulée", annulees: "annulées", annule: "annulé", annules: "annulés",
  terminee: "terminée", terminees: "terminées", termine: "terminé",
  proposee: "proposée", proposees: "proposées", acceptee: "acceptée", acceptees: "acceptées",
  refusee: "refusée", refusees: "refusées", payee: "payée", payees: "payées", paye: "payé", payes: "payés",
  declinee: "déclinée", validee: "validée", validees: "validées",
  // selection
  selectionner: "sélectionner", selectionnez: "sélectionnez", selection: "sélection",
  selectionnee: "sélectionnée", selectionnees: "sélectionnées",
  // divers e-grave / e-circonflexe
  etre: "être", meme: "même", memes: "mêmes", tres: "très", apres: "après", acces: "accès",
  succes: "succès", progres: "progrès", probleme: "problème", problemes: "problèmes",
  systeme: "système", systemes: "systèmes", modele: "modèle", modeles: "modèles",
  critere: "critère", criteres: "critères", reference: "référence", references: "références",
  caractere: "caractère", caracteres: "caractères", celebre: "célèbre", celebres: "célèbres",
  premiere: "première", premieres: "premières", deuxieme: "deuxième", troisieme: "troisième",
  derniere: "dernière", dernieres: "dernières", entiere: "entière", maniere: "manière",
  particuliere: "particulière", reguliere: "régulière", regulier: "régulier",
  reguliers: "réguliers", regulieres: "régulières", regulierement: "régulièrement",
  // -ite (qualite, securite...)
  qualite: "qualité", qualites: "qualités", quantite: "quantité", disponibilite: "disponibilité",
  disponibilites: "disponibilités", identite: "identité", propriete: "propriété", proprietes: "propriétés",
  proprietaire: "propriétaire", proprietaires: "propriétaires", realite: "réalité",
  fonctionnalite: "fonctionnalité", fonctionnalites: "fonctionnalités", fiabilite: "fiabilité",
  activite: "activité", activites: "activités", specificite: "spécificité",
  // specialise / specifique
  specialise: "spécialisé", specialisee: "spécialisée", specialises: "spécialisés",
  specialisees: "spécialisées", specifique: "spécifique", specifiques: "spécifiques",
  // reseau / region / memoire / ecran
  reseau: "réseau", reseaux: "réseaux", region: "région", regions: "régions", regional: "régional",
  memoire: "mémoire", ecran: "écran", ecrans: "écrans", ecotourisme: "écotourisme",
  evenement: "événement", evenements: "événements", itineraire: "itinéraire", itineraires: "itinéraires",
  // recu / apercu / francais (cedille)
  recu: "reçu", recus: "reçus", apercu: "aperçu", francais: "français", francaise: "française",
  // controle / depot (o-circonflexe)
  controle: "contrôle", controlee: "contrôlée", controler: "contrôler",
  depot: "dépôt", depots: "dépôts",
  // preparer / presenter / determiner
  preparer: "préparer", preparez: "préparez", preparee: "préparée",
  presenter: "présenter", presentez: "présentez", presentation: "présentation",
  presentee: "présentée", determiner: "déterminer", determinee: "déterminée",
  // gerer
  gerer: "gérer", gerez: "gérez", gere: "géré", gerees: "gérées", geree: "gérée",
  // divers
  delai: "délai", delais: "délais", echeance: "échéance", resume: "résumé",
  recapitulatif: "récapitulatif", integral: "intégral", integrale: "intégrale",
  integralement: "intégralement", interessant: "intéressant", interessante: "intéressante",
  interessantes: "intéressantes", interesse: "intéressé", reussi: "réussi", reussie: "réussie",
  modere: "modéré", moderee: "modérée", geolocalisation: "géolocalisation",
  geolocaliser: "géolocaliser", geocodage: "géocodage", caracteristique: "caractéristique",
  caracteristiques: "caractéristiques", deja: "déjà", procedure: "procédure",
  // -- 2e passe : participes -ee/-ees et verbes courants --
  passee: "passée", passees: "passées", reservable: "réservable", reservables: "réservables",
  demandee: "demandée", demandees: "demandées", bloquee: "bloquée", bloquees: "bloquées",
  bloque: "bloqué", bloques: "bloqués", recue: "reçue", recues: "reçues",
  eventuelle: "éventuelle", eventuel: "éventuel", eventuellement: "éventuellement",
  notifie: "notifié", notifiee: "notifiée", notifies: "notifiés", proceder: "procéder",
  idee: "idée", idees: "idées", annee: "année", annees: "années",
  donnee: "donnée", donnees: "données", entree: "entrée", entrees: "entrées",
  duree: "durée", durees: "durées", journee: "journée", journees: "journées",
  soiree: "soirée", soirees: "soirées", enregistree: "enregistrée", enregistrees: "enregistrées",
  enregistre: "enregistré", envoyee: "envoyée", envoye: "envoyé", envoyes: "envoyés",
  ajoutee: "ajoutée", ajoute: "ajouté", ajoutes: "ajoutés", supprimee: "supprimée",
  supprime: "supprimé", supprimes: "supprimés", modifiee: "modifiée", modifie: "modifié",
  modifies: "modifiés", activee: "activée", desactivee: "désactivée", desactive: "désactivé",
  desactiver: "désactiver", publiee: "publiée", publie: "publié", publies: "publiés",
  depubliee: "dépubliée", depublie: "dépublié", archivee: "archivée", generee: "générée",
  genere: "généré", generer: "générer", generes: "générés", liberee: "libérée",
  libere: "libéré", liberer: "libérer", liberes: "libérés", restituee: "restituée",
  restitue: "restitué", restituer: "restituer", expiree: "expirée", realisee: "réalisée",
  realise: "réalisé", realiser: "réaliser", realises: "réalisés", finalisee: "finalisée",
  finaliser: "finaliser", finalise: "finalisé", personnalisee: "personnalisée",
  personnalise: "personnalisé", personnaliser: "personnaliser", recommandee: "recommandée",
  recommande: "recommandé", privee: "privée", prive: "privé", prives: "privés", privees: "privées",
  propose: "proposé", proposes: "proposés", equipee: "équipée", equipees: "équipées",
  meublee: "meublée", meuble: "meublé", meubles: "meublés", meublees: "meublées",
  limitee: "limitée", illimitee: "illimitée", illimite: "illimité", nuitee: "nuitée",
  nuitees: "nuitées", complementaire: "complémentaire", complementaires: "complémentaires",
  necessaire: "nécessaire", necessaires: "nécessaires", prealable: "préalable",
  precedent: "précédent", precedente: "précédente", precedents: "précédents",
  categorie: "catégorie", categories: "catégories", planifiee: "planifiée", planifie: "planifié",
  programmee: "programmée", effectue: "effectué", effectuee: "effectuée", effectues: "effectués",
  declenche: "déclenché", declenchee: "déclenchée", declencher: "déclencher",
  traitee: "traitée", echouee: "échouée", echoue: "échoué", echec: "échec",
  reessayer: "réessayer", telecharger: "télécharger", telechargement: "téléchargement",
  telecharge: "téléchargé", importee: "importée", exportee: "exportée", partagee: "partagée",
  hebergement: "hébergement", hebergements: "hébergements", evaluee: "évaluée", evalue: "évalué",
  evaluation: "évaluation", numerique: "numérique", numeriques: "numériques",
  penalite: "pénalité", penalites: "pénalités", modalite: "modalité", modalites: "modalités",
  legales: "légales", legal: "légal", legale: "légale", legaux: "légaux",
  mentionnee: "mentionnée", mentionne: "mentionné", mentionnees: "mentionnées",
  prevu: "prévu", prevue: "prévue", prevus: "prévus", prevues: "prévues", prevoir: "prévoir",
  supplementaire: "supplémentaire", supplementaires: "supplémentaires",
  intermediaire: "intermédiaire", immediate: "immédiate", immediat: "immédiat",
  immediatement: "immédiatement", consideree: "considérée", considere: "considéré",
  considerer: "considérer", repondre: "répondre", repond: "répond", reponse: "réponse",
  reponses: "réponses", repondu: "répondu", accompagnee: "accompagnée", accompagne: "accompagné",
  desole: "désolé", desolee: "désolée", felicitations: "félicitations", approuvee: "approuvée",
  approuve: "approuvé", rejetee: "rejetée", rejete: "rejeté", numerotee: "numérotée",
  reglee: "réglée", reglees: "réglées", reglement: "règlement", reglements: "règlements",
  cle: "clé", cles: "clés", etat: "état", etats: "états", elevee: "élevée",
  pieces: "pièces", piece: "pièce",
  // -- 3e passe : encore d'autres mots frequents --
  vehicule: "véhicule", vehicules: "véhicules", parametre: "paramètre", parametres: "paramètres",
  demo: "démo", demonstration: "démonstration", mobilite: "mobilité", electrogene: "électrogène",
  electronique: "électronique", precis: "précis", precise: "précise", preciser: "préciser",
  precisez: "précisez", precisions: "précisions", procede: "procédé", repere: "repère",
  reperes: "repères", barriere: "barrière", frontiere: "frontière", lumiere: "lumière",
  riviere: "rivière", arriere: "arrière", matiere: "matière", matieres: "matières",
  portee: "portée", frequence: "fréquence", frequent: "fréquent", frequente: "fréquente",
  frequemment: "fréquemment", consequence: "conséquence", consequences: "conséquences",
  preference: "préférence", preferences: "préférences", difference: "différence",
  differences: "différences", different: "différent", differente: "différente",
  differents: "différents", differentes: "différentes", present: "présent", presents: "présents",
  recent: "récent", recente: "récente", recents: "récents", recentes: "récentes",
  recemment: "récemment", complete: "complète", completes: "complètes", concrete: "concrète",
  interet: "intérêt", interets: "intérêts", foret: "forêt", forets: "forêts",
  pret: "prêt", prete: "prête", prets: "prêts", bientot: "bientôt", plutot: "plutôt",
  gout: "goût", gouts: "goûts", coute: "coûte", cout: "coût", couts: "coûts",
  theme: "thème", themes: "thèmes", scene: "scène", scenes: "scènes", siege: "siège",
  privilege: "privilège", protegee: "protégée", protege: "protégé", proteger: "protéger",
  proteges: "protégés", numerote: "numéroté", regulee: "régulée",
  // -- 4e passe : sejour, equipe, et famille -ite/-te --
  sejour: "séjour", sejours: "séjours", equipe: "équipe", equipes: "équipes",
  equipement: "équipement", equipements: "équipements", proprete: "propreté",
  simplicite: "simplicité", facilite: "facilité", possibilite: "possibilité",
  possibilites: "possibilités", capacite: "capacité", capacites: "capacités",
  flexibilite: "flexibilité", electricite: "électricité", electrique: "électrique",
  publicite: "publicité", autorite: "autorité", autorites: "autorités",
  communaute: "communauté", communautes: "communautés", beaute: "beauté", sante: "santé",
  cite: "cité", cites: "cités", verite: "vérité", variete: "variété", varietes: "variétés",
  priorite: "priorité", proximite: "proximité", authenticite: "authenticité",
  specialite: "spécialité", specialites: "spécialités", controles: "contrôlés",
  controlees: "contrôlées", selectionnes: "sélectionnés", enregistres: "enregistrés",
  recommandees: "recommandées", notees: "notées",
  exterieur: "extérieur", interieur: "intérieur", superieur: "supérieur",
  inferieur: "inférieur", anterieur: "antérieur", posterieur: "postérieur",
  meteo: "météo", numero2: "",
};
delete (BASE as Record<string, string>).numero2;

// Noms de modeles / entites a NE PAS accentuer (audit entityType, types Prisma).
const MODEL_NAMES = new Set([
  "Residence", "Reservation", "Destination", "Pack", "Activity", "Payment", "Refund",
  "Payout", "PartnerProfile", "Setting", "User", "Review", "BlogPost", "ContentPage",
  "Amenity", "BusinessRequest", "Conversation", "Message", "Notification", "Session",
  "Favorite", "PartnerMission", "PartnerService", "PartnerMenuItem", "CustomPackRequest",
]);

// Attributs JSX dont la valeur est technique (jamais de texte affiche).
const SKIP_ATTRS = new Set([
  "className", "href", "src", "srcSet", "rel", "htmlFor", "id", "type", "name", "key",
  "value", "to", "as", "role", "method", "action", "target", "rev", "slug", "icon",
  "autoComplete", "inputMode", "style", "seed",
]);

// Construit la table complete : minuscule + Capitalisee.
const MAP: Record<string, string> = {};
for (const [k, v] of Object.entries(BASE)) {
  if (!k || !v) continue;
  MAP[k] = v;
  const cap = k[0].toUpperCase() + k.slice(1);
  const capV = v[0].toUpperCase() + v.slice(1);
  if (!(cap in MAP)) MAP[cap] = capV;
}
const KEYS = Object.keys(MAP).sort((a, b) => b.length - a.length);
// Frontieres "lettre" incluant les caracteres accentues (A-ÿ) : JS \b est
// ASCII-only, donc un accent agit comme une frontiere et permettrait de
// re-matcher un bout de mot adjacent a un accent (ex: "très" dans "paramètres"
// -> "paramètrès"). Les lookarounds rendent le script idempotent et sur.
const WORD_RE = new RegExp("(?<![A-Za-zÀ-ÿ])(" + KEYS.join("|") + ")(?![A-Za-zÀ-ÿ])", "g");

function applyDict(text: string): string {
  let out = text.replace(WORD_RE, (m) => MAP[m] ?? m);
  // Phrases speciales (a / o accent grave-circonflexe).
  out = out.replace(/Cote d'Ivoire/g, "Côte d'Ivoire").replace(/a partir de/g, "à partir de");
  return out;
}

function shouldSkipStringValue(text: string): boolean {
  if (!text.trim()) return true;
  if (text.includes("/")) return true; // chemins, URLs
  if (/^[A-Z0-9_]+$/.test(text)) return true; // enums MAJ
  if (/^[a-z0-9-]+$/.test(text)) return true; // slug / cle minuscule en un seul token
  if (MODEL_NAMES.has(text)) return true; // entityType / type Prisma
  return false;
}

interface Edit { start: number; end: number; text: string }

function processFile(file: string): number {
  const src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits: Edit[] = [];

  const visit = (node: ts.Node) => {
    // 1. Litteraux de chaine "..." / '...'
    if (ts.isStringLiteral(node)) {
      const p = node.parent;
      if (p && (ts.isImportDeclaration(p) || ts.isExportDeclaration(p))) return;
      if (p && ts.isJsxAttribute(p) && SKIP_ATTRS.has(p.name.getText())) return;
      if (!shouldSkipStringValue(node.text)) {
        const inner = src.slice(node.getStart() + 1, node.getEnd() - 1);
        const next = applyDict(inner);
        if (next !== inner) edits.push({ start: node.getStart() + 1, end: node.getEnd() - 1, text: next });
      }
      return;
    }
    // 2. Template sans substitution `...`
    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      if (!node.text.includes("/")) {
        const inner = src.slice(node.getStart() + 1, node.getEnd() - 1);
        const next = applyDict(inner);
        if (next !== inner) edits.push({ start: node.getStart() + 1, end: node.getEnd() - 1, text: next });
      }
      return;
    }
    // 2bis. Parties de template avec substitution `a ${x} b` (head/middle/tail).
    // On saute toute partie contenant "/" (chemins, balises HTML d'emails).
    if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      const isTail = ts.isTemplateTail(node);
      const innerStart = node.getStart() + 1; // apres ` ou }
      const innerEnd = node.getEnd() - (isTail ? 1 : 2); // avant ` ou ${
      if (innerEnd > innerStart) {
        const inner = src.slice(innerStart, innerEnd);
        if (!inner.includes("/")) {
          const next = applyDict(inner);
          if (next !== inner) edits.push({ start: innerStart, end: innerEnd, text: next });
        }
      }
      return;
    }
    // 3. Texte JSX
    if (ts.isJsxText(node)) {
      const raw = node.getText();
      if (raw.trim()) {
        const next = applyDict(raw);
        if (next !== raw) edits.push({ start: node.getStart(), end: node.getEnd(), text: next });
      }
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  if (edits.length === 0) return 0;
  if (!DRY) {
    let out = src;
    edits.sort((a, b) => b.start - a.start);
    for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    fs.writeFileSync(file, out, "utf8");
  }
  return edits.length;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|ts)$/.test(name)) out.push(full);
  }
  return out;
}

function main() {
  const files = walk(ROOT);
  let totalEdits = 0, changedFiles = 0;
  const samples: string[] = [];
  for (const f of files) {
    const n = processFile(f);
    if (n > 0) { totalEdits += n; changedFiles++; if (samples.length < 12) samples.push(`  ${path.relative(ROOT, f)} (${n})`); }
  }
  console.log(`${DRY ? "[DRY] " : ""}${changedFiles} fichiers, ${totalEdits} remplacements.`);
  console.log(samples.join("\n"));
}

main();
