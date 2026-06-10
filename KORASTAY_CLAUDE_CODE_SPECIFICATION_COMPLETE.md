# KoraStay - Spécification complète pour Claude Code

> **Objectif du fichier** : donner à Claude Code toutes les informations nécessaires pour construire une web application KoraStay fonctionnelle, professionnelle, moderne et exploitable.
>
> **Instruction centrale** : construire KoraStay comme une nouvelle plateforme complète, sans reprendre le design déjà utilisé dans l'ancien prototype. Le design doit être repensé de zéro, avec une expérience desktop premium et une expérience mobile distincte, très inspirée de l'ergonomie mobile Airbnb, sans copier son identité visuelle, ses textes, ses images, son code ou ses éléments protégés.

---

## 1. Identité du projet

### 1.1 Nom final

Le projet s'appelle **KoraStay**.

KoraStay est l'évolution de l'ancien concept StayCI. Tous les contenus métier issus des documents StayCI doivent être adaptés à KoraStay. Le nom **StayCI** ne doit pas apparaître dans l'interface finale, sauf dans des commentaires de migration ou archives internes si nécessaire. Pour l'utilisateur final, la marque visible est uniquement **KoraStay**.

### 1.2 Nature du projet

KoraStay est une plateforme web de réservation de résidences meublées vérifiées, de séjours touristiques accompagnés et d'offres business pour voyageurs, entreprises, propriétaires et partenaires locaux.

La plateforme combine :

- un catalogue de résidences meublées vérifiées ;
- un moteur de recherche et de réservation ;
- des packs touristiques accompagnés ;
- un espace propriétaire pour gérer les résidences, disponibilités, réservations et revenus ;
- un espace voyageur pour réserver, suivre ses séjours, annuler, évaluer et conserver ses favoris ;
- un espace partenaire pour guides, transporteurs, restaurants, prestataires d'activités et autres partenaires ;
- un espace business pour entreprises, ONG, institutions et équipes en mission ;
- un back-office administrateur complet ;
- un service d'assistance et de notifications.

### 1.3 Positionnement

KoraStay doit être positionnée comme une plateforme locale et ouest-africaine, fiable, moderne, rassurante et hautement qualitative.

Le positionnement initial hérite de StayCI : une plateforme de réservation de résidences meublées et de séjours touristiques accompagnés, d'abord opérationnelle en Côte d'Ivoire, avec vocation à s'étendre progressivement à l'Afrique de l'Ouest.

Le nouveau positionnement KoraStay est donc :

> **KoraStay, la plateforme ouest-africaine qui simplifie la réservation de résidences vérifiées et l'organisation de séjours authentiques, professionnels ou touristiques.**

### 1.4 Slogan recommandé

Utiliser comme slogan principal :

> **Réservez votre séjour, vivez l'exception.**

Variante possible pour les pages marketing :

> **Des résidences vérifiées. Des expériences locales. Un séjour sans incertitude.**

### 1.5 Vision

KoraStay aspire à devenir la plateforme de référence en Afrique de l'Ouest pour la réservation de résidences meublées vérifiées et l'organisation de séjours touristiques, professionnels ou familiaux avec accompagnement local.

### 1.6 Mission

La mission de KoraStay est d'offrir aux voyageurs, familles, professionnels, entreprises, institutions, touristes locaux, membres de la diaspora et visiteurs internationaux une solution simple, sécurisée et complète pour réserver un hébergement fiable et organiser leur séjour avec l'appui d'un réseau local de propriétaires, guides, restaurants, transporteurs et prestataires vérifiés.

### 1.7 Valeurs

KoraStay doit communiquer les valeurs suivantes :

1. **Confiance** : chaque résidence doit être vérifiée, chaque partenaire sélectionné, chaque promesse tenue.
2. **Ancrage local** : la plateforme est construite pour répondre aux réalités des villes ivoiriennes et ouest-africaines, y compris les villes de l'intérieur.
3. **Excellence** : standard élevé sur les résidences, les packs, le service client et l'expérience utilisateur.
4. **Proximité** : assistance humaine avant, pendant et après le séjour.
5. **Innovation utile** : numérique, réservation en ligne, paiement mobile, notifications, tableau de bord, mais toujours au service d'une expérience humaine fiable.

---

## 2. Problèmes à résoudre

KoraStay doit répondre aux problèmes suivants :

### 2.1 Absence de plateforme locale structurée

Les voyageurs recherchent souvent des résidences meublées via WhatsApp, réseaux sociaux ou contacts informels. Il manque une plateforme locale professionnelle, fiable et spécialisée dans les résidences meublées et les séjours organisés.

### 2.2 Manque de confiance et de vérification

Les annonces disponibles en ligne ou sur les réseaux sociaux ne sont pas toujours vérifiées. Le voyageur prend un risque sur la conformité, la propreté, la sécurité, la disponibilité réelle et le sérieux du propriétaire.

### 2.3 Absence d'accompagnement intégré

Le voyageur doit souvent gérer séparément l'hébergement, le transport, la restauration, les activités et les recommandations locales. KoraStay doit centraliser ces éléments.

### 2.4 Faible visibilité des propriétaires locaux

Les propriétaires de résidences meublées manquent d'outils pour gérer leurs calendriers, publier leurs biens, recevoir des réservations, suivre leurs revenus et professionnaliser leur offre.

### 2.5 Sous-exploitation du potentiel touristique des villes de l'intérieur

Des villes comme Daloa, Man, Yamoussoukro, San-Pédro, Korhogo, Bouaké, Abengourou, Grand-Bassam ou Assinie ont un potentiel touristique, culturel ou professionnel, mais l'offre de séjour est peu structurée.

### 2.6 Besoin professionnel et B2B non adressé

Les entreprises, ONG, administrations et institutions ont besoin d'hébergements fiables, facturables, bien équipés, avec assistance, pour leurs collaborateurs en mission.

---

## 3. Solution KoraStay

KoraStay propose une solution intégrée autour de cinq pôles.

### 3.1 KoraStay Résidences

Catalogue de résidences meublées vérifiées dans les principales villes. Chaque fiche résidence doit comporter :

- photos professionnelles ou de haute qualité ;
- titre ;
- ville, quartier, zone ;
- capacité ;
- nombre de chambres, lits, salles de bain ;
- équipements ;
- description détaillée ;
- règlement intérieur ;
- prix par nuit, semaine ou mois si applicable ;
- disponibilité ;
- badge de vérification ;
- avis voyageurs ;
- bouton de réservation ;
- carte ou localisation approximative ;
- services optionnels.

### 3.2 KoraStay Découverte

Packs touristiques accompagnés clés en main. Les packs peuvent inclure :

- hébergement ;
- petit déjeuner ;
- transport en ville ;
- guide local ;
- activités ;
- droits d'entrée de sites ;
- programme jour par jour ;
- recommandations pratiques ;
- conditions d'annulation.

### 3.3 KoraStay Business

Offre dédiée aux entreprises, ONG, administrations et institutions. Elle doit permettre :

- demandes de devis ;
- réservations de logements adaptés aux professionnels ;
- facturation dédiée ;
- contrats cadres ;
- assistance dédiée ;
- gestion d'équipes ;
- rapport mensuel des séjours et dépenses ;
- historique des missions.

### 3.4 KoraStay Partners

Programme de partenariat destiné aux :

- propriétaires de résidences ;
- guides touristiques ;
- transporteurs ;
- restaurants ;
- prestataires d'activités ;
- autres prestataires locaux.

Chaque partenaire doit avoir un espace de gestion, un statut de validation, un profil public ou semi-public, des services, disponibilités, missions, revenus et notifications.

### 3.5 KoraStay Assistance

Service d'accompagnement client avant, pendant et après le séjour. Il doit couvrir :

- demandes d'information ;
- modifications de réservation ;
- annulations ;
- réclamations ;
- incidents ;
- urgence voyageur ;
- mise en relation propriétaire/voyageur/partenaire ;
- suivi de satisfaction.

---

## 4. Publics cibles

### 4.1 Voyageurs particuliers

- voyageurs ivoiriens ;
- familles ;
- couples ;
- groupes d'amis ;
- étudiants en déplacement ;
- parents d'étudiants ;
- membres de la diaspora ;
- touristes locaux ;
- touristes sous-régionaux ;
- touristes internationaux.

### 4.2 Professionnels

- cadres en mission ;
- consultants ;
- agents d'entreprise ;
- ONG ;
- administrations publiques ;
- institutions de développement ;
- délégations officielles ;
- équipes projet.

### 4.3 Propriétaires

- propriétaires de résidences meublées ;
- gestionnaires de biens ;
- petites structures d'hébergement ;
- propriétaires souhaitant professionnaliser leur activité et augmenter leur taux d'occupation.

### 4.4 Partenaires commerciaux

- restaurants ;
- guides touristiques ;
- transporteurs ;
- chauffeurs ;
- agences locales ;
- prestataires d'activités ;
- photographes, vloggers ou créateurs d'expérience.

### 4.5 Administrateurs KoraStay

- équipe de gestion ;
- support client ;
- validation qualité ;
- gestion financière ;
- gestion partenaires ;
- direction.

---

## 5. Marchés et villes prioritaires

### 5.1 Phase pilote

La phase pilote est centrée sur **Daloa**, dans la région du Haut-Sassandra, avec **Lux Résidence** comme résidence fondatrice.

Données à intégrer :

- Ville pilote : Daloa ;
- Région : Haut-Sassandra ;
- Résidence fondatrice : Lux Résidence - Daloa, Lobia 2 ;
- Objectif initial : 5 à 10 résidences partenaires référencées ;
- Packs disponibles : Pack Découverte Daloa ;
- Partenaires locaux minimum : 2 restaurants, 2 guides, 2 transporteurs ;
- Livrable : site web MVP en ligne, réservation fonctionnelle, premiers avis clients.

### 5.2 Villes prioritaires d'extension

Prévoir ces villes dans le modèle de données et dans les contenus de démonstration :

| Ville | Région / zone | Potentiel | Priorité |
|---|---|---|---|
| Daloa | Haut-Sassandra | Résidence pilote, ville fondatrice | Phase 1 |
| Man | Tonkpi | Dent de Man, cascade, forêt, pont de lianes | Haute |
| Yamoussoukro | Lacs | Basilique, crocodiles sacrés, monuments | Haute |
| San-Pédro | San-Pédro | Port, plages, économie en croissance | Haute |
| Korhogo | Poro | Culture sénoufo, artisanat, réserve | Moyenne |
| Bouaké | Gbêkê | Deuxième ville, flux professionnels | Moyenne |
| Abengourou | Indénié-Djuablin | Nature, proximité Ghana | Basse |
| Grand-Bassam | Lagunes | Patrimoine UNESCO, plages | Phase 3 |
| Assinie | Sud-Comoé | Plages, lagune, tourisme balnéaire | Phase 3 |
| Abidjan | Abidjan | Hub économique et complément national | Phase 3 |

---

## 6. Offres à intégrer

### 6.1 KoraStay Résidences

Types de résidences :

| Type | Capacité | Description | Équipements standard |
|---|---:|---|---|
| Studio meublé | 1-2 personnes | Logement compact, idéal court séjour | Lit, climatisation, eau chaude, kitchenette |
| Appartement T2 | 2-3 personnes | Salon + 1 chambre, confort familial | Cuisine équipée, climatisation, WiFi, salon |
| Appartement T3 | 4-5 personnes | Salon + 2 chambres, adapté familles | Cuisine équipée, 2 chambres, climatisation, WiFi |
| Villa / Maison | 6+ personnes | Espace privatif pour groupes | Cuisine, extérieur, parking, salon, climatisation |

Services optionnels :

- petit déjeuner ;
- ménage quotidien ou à la demande ;
- transport depuis/vers gare ou aéroport ;
- guide local recommandé ;
- réductions restaurants partenaires ;
- service de blanchisserie ;
- accueil personnalisé ;
- décoration événementielle ou romantique ;
- shooting photo, si offre disponible.

### 6.2 KoraStay Découverte - packs touristiques pilotes

#### Pack Découverte Daloa

- Destination : Daloa - Haut-Sassandra ;
- Durée : 2 jours / 1 nuit ;
- Personnes : 2 personnes ;
- Prix indicatif : 100 000 F CFA tout compris ;
- Hébergement : Lux Résidence ou résidence partenaire vérifiée à Daloa ;
- Petit déjeuner : inclus les 2 matins ;
- Transport : taxi privé dans la ville pendant toute la durée ;
- Guide : guide local francophone certifié KoraStay ;
- Programme jour 1 : arrivée, installation, visite du village des singes, soirée au bord de la Sassandra ;
- Programme jour 2 : Île Bambou, roche de l'Éléphant, Pacifik Lodges-Kibouo, départ ;
- Inclus : hébergement, petit déjeuner, taxi en ville, guide local ;
- Non inclus : transport aller-retour vers Daloa, déjeuners, dîners, achats personnels.

#### Pack Découverte Man

- Destination : Man - Tonkpi ;
- Durée : 2 jours / 1 nuit ;
- Personnes : 2 personnes ;
- Prix indicatif : 120 000 F CFA tout compris ;
- Hébergement : chambre dans une résidence vérifiée KoraStay à Man ;
- Petit déjeuner : inclus les 2 matins ;
- Transport : taxi privé dans la ville pendant toute la durée ;
- Guide : guide local francophone certifié KoraStay ;
- Programme jour 1 : arrivée, installation, visite de la cascade naturelle de Man, soirée libre ;
- Programme jour 2 : forêt des singes, Dent de Man, pont de lianes, départ ;
- Inclus : hébergement, petit déjeuner, taxi en ville, guide local, droits d'entrée des sites inclus si prévu ;
- Non inclus : transport aller-retour vers Man, déjeuners, dîners, achats personnels.

#### Packs à venir

- Pack Découverte Yamoussoukro : Basilique, crocodiles sacrés, musées, lac ;
- Pack Découverte San-Pédro : plages, port, Parc national de Taï, forêt ;
- Pack Découverte Korhogo : artisanat sénoufo, Waraniéné, réserve ;
- Pack Découverte Bouaké : marché central, gastronomie, patrimoine culturel ;
- Pack Grand-Bassam Patrimoine : quartier historique UNESCO, plages, musées ;
- Pack Assinie Évasion : lagune, plages, détente, activités nautiques.

### 6.3 KoraStay Business

Services Business :

| Service | Description |
|---|---|
| Hébergement entreprise | Réservation de résidences adaptées aux professionnels : WiFi, bureau, calme, proximité services |
| Contrat cadre annuel | Tarifs négociés pour volumes de réservations récurrentes |
| Facturation dédiée | Factures avec TVA si applicable, numéro de bon de commande, formats entreprise |
| Assistance dédiée | Interlocuteur KoraStay Business |
| Gestion centralisée | Interface pour gérer les réservations de l'équipe |
| Rapport mensuel | Récapitulatif des séjours et dépenses par équipe, département ou mission |

---

## 7. Standards qualité des résidences

### 7.1 Conditions générales d'éligibilité

Une résidence peut être publiée uniquement si :

- elle est légalement habitable ;
- le propriétaire est propriétaire légal ou mandataire autorisé ;
- elle est entièrement meublée et équipée pour un séjour autonome ;
- les photos sont réelles, récentes et représentatives ;
- elle respecte les standards de propreté, sécurité, équipement et disponibilité ;
- elle a été soumise à validation administrative ou physique par KoraStay.

### 7.2 Équipements obligatoires

| Équipement | Standard requis |
|---|---|
| Literie | Matelas propre et en bon état, linge fourni et lavé entre chaque séjour |
| Salle de bain | WC fonctionnel, douche ou baignoire, eau chaude disponible si annoncée |
| Cuisine / kitchenette | Réfrigérateur, plaques de cuisson, vaisselle de base, ustensiles |
| Électricité | Installation conforme, éclairage suffisant |
| Ventilation / climatisation | Ventilateur ou climatiseur fonctionnel selon standing |
| Connectivité | WiFi recommandé, obligatoire pour standing Confort ou Premium |
| Sécurité | Porte avec serrure sûre, fenêtres sécurisées, environnement raisonnablement sûr |
| Propreté | Nettoyage complet avant chaque arrivée |

### 7.3 Niveaux de qualité

| Niveau | Désignation | Critères |
|---|---|---|
| 2 étoiles | Essentiel | Équipements de base, propre, fonctionnel, sans service additionnel |
| 3 étoiles | Confort | Climatisation, WiFi, bonne literie, cuisine équipée, localisation centrale |
| 4 étoiles | Premium | Mobilier moderne, décoration soignée, équipements haut de gamme, services inclus |

### 7.4 Processus de validation

1. Soumission du dossier par le propriétaire : formulaire, photos, description, tarifs, pièces justificatives.
2. Examen par l'équipe KoraStay sous 5 jours ouvrés.
3. Demande de compléments si nécessaire.
4. Attribution du niveau de qualité.
5. Attribution du badge **Résidence vérifiée KoraStay**.
6. Publication sur la plateforme.
7. Possibilité de visite de vérification avant ou après publication.
8. Suspension possible en cas de non-conformité, réclamation grave, photos trompeuses ou indisponibilités répétées.

---

## 8. Règles de réservation

### 8.1 Étapes de réservation résidence

1. Le voyageur recherche une ville, des dates, un type de séjour, un nombre de personnes.
2. Le système affiche les résidences disponibles et filtrables.
3. Le voyageur consulte une fiche résidence.
4. Il sélectionne les dates et le nombre de voyageurs.
5. Le système vérifie les disponibilités en temps réel.
6. Le système bloque provisoirement le créneau pendant 15 minutes durant le paiement.
7. Le système calcule le prix total : nombre de nuits x tarif par nuit + frais de service + éventuels frais de ménage ou services optionnels.
8. Le voyageur saisit ou confirme ses informations.
9. Il accepte les conditions générales de réservation et la politique d'annulation.
10. Il choisit un mode de paiement.
11. Le paiement est traité.
12. Si paiement confirmé : réservation confirmée, notifications envoyées, dates bloquées.
13. Si paiement échoué ou expiré : réservation non confirmée, dates libérées.

### 8.2 Étapes de réservation pack

1. Le voyageur choisit un pack.
2. Il sélectionne la date de départ, le nombre de personnes, les options éventuelles.
3. Le système vérifie les disponibilités : résidence, guide, transport, activités.
4. Le prix total est calculé.
5. Le voyageur confirme les informations.
6. Il accepte les conditions.
7. Il paie.
8. KoraStay notifie les partenaires concernés.
9. Le voyageur reçoit un bon de réservation pack avec programme.

### 8.3 Réservation business

1. Une entreprise ou institution soumet une demande.
2. Elle indique : organisation, contact, ville, nombre de personnes, dates, besoins, budget, exigences.
3. L'équipe admin reçoit la demande.
4. L'admin peut créer un devis.
5. Le client business valide le devis.
6. L'admin confirme les réservations associées.
7. Facturation et suivi dans l'espace Business.

### 8.4 Anti-double réservation

Le système doit impérativement éviter la double réservation :

- utiliser des transactions côté base de données ;
- créer une contrainte logique sur les périodes qui se chevauchent ;
- vérifier les dates juste avant paiement ;
- bloquer temporairement les dates pendant le paiement ;
- libérer automatiquement les réservations expirées ;
- ne jamais confirmer une réservation si un chevauchement existe avec une réservation confirmée.

### 8.5 Dates passées

Les calendriers publics et administratifs ne doivent pas permettre la réservation dans le passé. Les dates passées doivent être désactivées visuellement.

### 8.6 Calendrier moderne

Les fiches résidence doivent intégrer un calendrier moderne :

- ouverture au clic ;
- sélection arrivée/départ ;
- dates indisponibles visibles ;
- dates passées désactivées ;
- prix ou disponibilité éventuellement affichés par jour ;
- affichage mobile en bottom sheet ;
- affichage desktop dans un panneau ou popover propre.

---

## 9. Paiement

### 9.1 Modes de paiement prévus

À intégrer via architecture extensible :

- Orange Money Côte d'Ivoire ;
- Wave ;
- MTN MoMo en phase 2 ;
- carte bancaire Visa / MasterCard via agrégateur agréé ;
- paiement manuel admin en mode transition si nécessaire.

### 9.2 Architecture paiement recommandée

Créer une couche d'abstraction `PaymentProvider` avec plusieurs adaptateurs :

- `MockPaymentProvider` pour développement et démonstration ;
- `ManualPaymentProvider` pour paiement confirmé manuellement par admin ;
- `MobileMoneyProvider` à connecter plus tard à un agrégateur ;
- `CardProvider` à connecter plus tard.

Ne pas bloquer la construction de la plateforme parce que les clés API de paiement ne sont pas encore disponibles.

### 9.3 États de paiement

- `PENDING` : paiement initié ;
- `PROCESSING` : en cours ;
- `PAID` : paiement confirmé ;
- `FAILED` : paiement échoué ;
- `EXPIRED` : tentative expirée ;
- `REFUNDED` : remboursement total ;
- `PARTIALLY_REFUNDED` : remboursement partiel ;
- `CANCELLED` : paiement annulé.

### 9.4 Reçu et confirmation

Après paiement réussi :

- générer un reçu PDF ;
- envoyer un email de confirmation ;
- envoyer une notification au propriétaire ;
- envoyer une notification admin ;
- afficher une page de succès claire ;
- enregistrer la transaction dans l'admin.

---

## 10. Politique d'annulation et remboursement

### 10.1 Résidences - annulation voyageur

| Délai avant check-in | Remboursement | Frais de service |
|---|---|---|
| Plus de 72 heures | Remboursement intégral de la nuitée | Non remboursés |
| Entre 24 et 72 heures | Remboursement de 50% de la nuitée | Non remboursés |
| Moins de 24 heures ou no-show | Aucun remboursement | Non remboursés |

### 10.2 Packs touristiques - annulation voyageur

| Délai avant départ | Remboursement | Frais de service |
|---|---|---|
| Plus de 7 jours | Remboursement intégral du pack | Non remboursés |
| Entre 3 et 7 jours | Remboursement de 50% du pack | Non remboursés |
| Moins de 3 jours ou no-show | Aucun remboursement | Non remboursés |

### 10.3 Annulation par propriétaire

En cas d'annulation par le propriétaire après confirmation :

- remboursement intégral du voyageur, y compris frais de service ;
- proposition d'une alternative disponible dans la même ville si possible ;
- alerte admin ;
- suivi du nombre d'annulations propriétaire ;
- suspension possible en cas d'annulations répétées ou abusives.

### 10.4 Annulation par KoraStay

KoraStay peut annuler en cas de :

- force majeure ;
- non-conformité grave ;
- fraude ;
- risque pour le voyageur ;
- litige sérieux.

Dans ces cas, le remboursement peut inclure les frais de service selon décision admin.

### 10.5 Workflow annulation

1. Demande d'annulation depuis l'espace personnel ou via assistance.
2. Création d'un dossier d'annulation.
3. Calcul automatique du remboursement théorique.
4. Validation admin si paiement réel.
5. Changement de statut réservation.
6. Traitement du remboursement.
7. Notification des parties.
8. Journalisation dans l'audit log.

---

## 11. Rôles et permissions

### 11.1 Rôles principaux

- `VISITOR` : utilisateur non connecté ;
- `TRAVELER` : voyageur connecté ;
- `OWNER` : propriétaire de résidence ;
- `PARTNER` : partenaire commercial ;
- `BUSINESS` : compte entreprise/institution ;
- `SUPPORT` : support client ;
- `ADMIN` : administrateur ;
- `SUPER_ADMIN` : contrôle complet.

### 11.2 Sous-types partenaire

- `GUIDE` ;
- `TRANSPORT` ;
- `RESTAURANT` ;
- `ACTIVITY` ;
- `OTHER`.

### 11.3 Permissions par rôle

#### Visiteur

- voir page d'accueil ;
- rechercher résidences ;
- consulter détails résidences ;
- consulter packs ;
- consulter pages marketing ;
- créer un compte ;
- contacter KoraStay ;
- soumettre demande business ou partenaire.

#### Voyageur

- réserver résidence ;
- réserver pack ;
- payer ;
- consulter ses réservations ;
- annuler selon conditions ;
- gérer profil ;
- gérer favoris ;
- laisser avis après séjour ;
- contacter assistance ;
- échanger avec propriétaire ou support si réservation active.

#### Propriétaire

- soumettre demande propriétaire ;
- créer, modifier, publier/dépublier ses résidences selon statut ;
- ajouter/supprimer/réorganiser photos ;
- gérer équipements ;
- gérer tarifs ;
- gérer calendrier et dates bloquées ;
- voir réservations ;
- accepter ou consulter les réservations selon modèle ;
- consulter revenus ;
- répondre aux messages ;
- consulter avis ;
- demander assistance.

#### Partenaire

- compléter profil ;
- créer services ;
- définir ville(s) et zones couvertes ;
- gérer disponibilités ;
- recevoir propositions de mission ;
- accepter/refuser une mission ;
- consulter missions passées ;
- consulter revenus ;
- échanger avec admin/support.

#### Business

- créer organisation ;
- gérer informations entreprise ;
- demander devis ;
- gérer demandes de séjour ;
- ajouter membres d'équipe ;
- consulter factures ;
- consulter rapports de séjour ;
- contacter interlocuteur dédié.

#### Support

- consulter réservations ;
- répondre conversations assistance ;
- gérer réclamations ;
- créer notes internes ;
- déclencher notifications ;
- escalader vers admin.

#### Admin

- gestion totale des utilisateurs ;
- validation propriétaires, partenaires, résidences ;
- gestion réservations ;
- gestion paiements, remboursements et litiges ;
- gestion packs ;
- gestion destinations ;
- gestion contenu ;
- statistiques ;
- exports ;
- audit.

#### Super Admin

- tous les droits admin ;
- gestion des rôles sensibles ;
- configuration système ;
- suppression définitive contrôlée ;
- paramètres financiers ;
- paramètres de paiement ;
- accès logs complets.

---

## 12. Parcours utilisateur complets

## 12.1 Parcours public - découverte et recherche

1. L'utilisateur arrive sur la page d'accueil.
2. Il voit un hero premium avec image immersive, slogan, barre de recherche.
3. Il peut rechercher par destination, dates, type de séjour et nombre de personnes.
4. Il accède à une page de résultats.
5. Il filtre par ville, quartier, prix, capacité, type de logement, équipements, note, badge vérifié.
6. Il peut basculer entre liste, grille et carte si carte activée.
7. Il consulte une fiche résidence.
8. Il ouvre la galerie photo.
9. Il consulte description, équipements, avis, règlement, localisation, prix.
10. Il clique sur réserver ou ajoute aux favoris.

### 12.2 Parcours inscription voyageur

1. L'utilisateur clique sur créer un compte.
2. Il choisit compte voyageur par défaut.
3. Il renseigne nom, prénom, email, téléphone, mot de passe.
4. Il accepte les conditions.
5. Le système crée le compte.
6. Le système envoie un email de vérification.
7. Une page ou alerte indique clairement qu'un email de confirmation a été envoyé.
8. L'utilisateur clique sur le lien.
9. Le compte devient vérifié.
10. Il est redirigé vers connexion ou espace compte avec message de succès.

### 12.3 Parcours connexion

1. Email + mot de passe.
2. Vérification compte actif.
3. Redirection selon rôle :
   - voyageur : `/account` ;
   - propriétaire : `/owner` ;
   - partenaire : `/partner` ;
   - business : `/business/dashboard` ;
   - admin : `/admin`.
4. Si compte non vérifié : afficher message et bouton renvoyer email.
5. Si mauvais identifiants : message clair sans divulguer d'information sensible.

### 12.4 Parcours réservation résidence

1. Le voyageur choisit une résidence.
2. Il sélectionne date d'arrivée et de départ.
3. Il sélectionne nombre d'adultes/enfants.
4. Le système affiche prix détaillé : nuits, tarif, frais de service, options.
5. Il clique réserver.
6. Si non connecté : redirection login/register puis retour au panier.
7. Il confirme ses coordonnées.
8. Il accepte CGR et politique d'annulation.
9. Il choisit paiement.
10. Le système crée une réservation `PENDING_PAYMENT` et un paiement `PENDING`.
11. Les dates sont temporairement verrouillées.
12. Si paiement réussi : réservation `CONFIRMED`.
13. Notifications envoyées.
14. Page succès avec bon de réservation.
15. Réservation visible dans espace compte.

### 12.5 Parcours annulation voyageur

1. Le voyageur ouvre sa réservation.
2. Il clique annuler.
3. Le système affiche montant remboursable selon règle.
4. Il confirme.
5. Réservation passe en `CANCELLATION_REQUESTED` ou `CANCELLED` selon modèle.
6. Admin reçoit alerte si remboursement réel à traiter.
7. Après traitement : `REFUNDED`, `PARTIALLY_REFUNDED` ou `NO_REFUND`.
8. Notifications envoyées.

### 12.6 Parcours avis

1. Après date de check-out ou fin de pack, le voyageur peut laisser un avis.
2. Avis comprend note globale, propreté, emplacement, qualité/prix, communication, commentaire.
3. L'avis est publié immédiatement.
4. Admin peut masquer ou supprimer plus tard.
5. Propriétaire peut répondre si fonctionnalité activée.

### 12.7 Parcours favoris

1. Voyageur connecté clique sur cœur d'une résidence ou d'un pack.
2. L'élément est ajouté aux favoris.
3. Le cœur change d'état.
4. Favoris visibles dans `/account/favorites`.
5. Sur mobile, onglet Favoris dans la bottom navigation.

### 12.8 Parcours propriétaire - demande d'inscription

1. Propriétaire clique sur devenir propriétaire.
2. Il remplit formulaire : identité, contact, ville, nombre de résidences, type de biens, message.
3. Compte propriétaire créé ou demande enregistrée.
4. Statut initial : `PENDING_REVIEW`.
5. Admin examine.
6. Admin valide ou refuse.
7. Si validé : accès espace propriétaire.
8. Email envoyé.

### 12.9 Parcours propriétaire - création résidence

1. Propriétaire ouvre `/owner/residences/new`.
2. Il remplit :
   - nom ;
   - ville ;
   - quartier ;
   - adresse ;
   - type ;
   - capacité ;
   - chambres ;
   - lits ;
   - salles de bain ;
   - description ;
   - tarifs ;
   - équipements ;
   - règlement intérieur ;
   - horaires check-in/check-out ;
   - photos.
3. Il soumet pour validation.
4. Statut résidence : `PENDING_VALIDATION`.
5. Admin vérifie.
6. Admin attribue niveau qualité.
7. Admin publie.
8. Résidence devient visible.

### 12.10 Parcours propriétaire - gestion calendrier

1. Propriétaire accède au calendrier.
2. Il voit réservations confirmées, dates bloquées, dates libres.
3. Il peut bloquer une période.
4. Il peut débloquer ses blocages manuels.
5. Il ne peut pas débloquer une réservation confirmée sans annulation admin.
6. Il reçoit alerte nouvelle réservation.

### 12.11 Parcours partenaire - inscription

1. Partenaire choisit son type : guide, transporteur, restaurant, activité, autre.
2. Il renseigne identité, ville, zones couvertes, services, tarifs indicatifs, documents, photos.
3. Statut : `PENDING_REVIEW`.
4. Admin valide.
5. Le partenaire complète son profil.
6. Il peut recevoir missions ou être proposé automatiquement selon ville.

### 12.12 Parcours partenaire - mission

1. Une réservation ou un pack nécessite guide/transport/restaurant.
2. Le système propose automatiquement les partenaires compatibles par ville, type, disponibilité et statut validé.
3. Admin ou voyageur choisit un partenaire selon le parcours.
4. Partenaire reçoit notification.
5. Il accepte ou refuse.
6. Si accepté : mission confirmée.
7. Après réalisation : mission terminée, paiement ou revenu marqué.

### 12.13 Parcours pack personnalisé

1. Voyageur ouvre `/packs/custom`.
2. Il choisit destination.
3. Il indique dates, personnes, budget, style de séjour.
4. Il choisit activités : nature, culture, gastronomie, détente, aventure, business, famille.
5. Il peut choisir options : guide, transport, restauration, shooting photo.
6. Le système propose une combinaison : résidence + activités + partenaires.
7. Le voyageur demande devis ou réserve si prix calculable.
8. Admin reçoit la demande et peut transformer en pack réservé.

### 12.14 Parcours Business

1. Entreprise ouvre `/business`.
2. Elle remplit demande : nom organisation, type, secteur, contact, email, téléphone, ville, mission, taille équipe, dates, exigences.
3. Demande enregistrée.
4. Admin la traite.
5. Admin crée devis ou proposition.
6. Entreprise suit dans son espace si compte créé.
7. Réservations associées créées après validation.
8. Factures disponibles.

### 12.15 Parcours admin - validation résidence

1. Admin ouvre liste résidences en attente.
2. Il consulte fiche complète.
3. Il vérifie photos, équipements, prix, propriétaire.
4. Il attribue : Essentiel, Confort ou Premium.
5. Il peut demander correction.
6. Il valide et publie.
7. Le système attribue badge vérifié.
8. Notification propriétaire.

### 12.16 Parcours admin - gestion réservation

1. Admin consulte réservations avec filtres.
2. Il ouvre détail.
3. Il voit voyageur, résidence/pack, paiement, dates, propriétaire, historique.
4. Il peut confirmer manuellement, annuler, déclencher remboursement, ajouter note interne, contacter parties.
5. Chaque action est journalisée.

### 12.17 Parcours support

1. Support consulte conversations et demandes.
2. Il répond ou escalade.
3. Il ajoute notes internes.
4. Il peut associer ticket à réservation.
5. Il clôture la demande après résolution.

---

## 13. Pages et routes à construire

### 13.1 Pages publiques

- `/` : accueil ;
- `/residences` : catalogue résidences ;
- `/residences/[slug]` : détail résidence ;
- `/packs` : catalogue packs ;
- `/packs/[slug]` : détail pack ;
- `/packs/custom` : création pack personnalisé ;
- `/destinations` : destinations ;
- `/destinations/[slug]` : page ville/destination ;
- `/business` : offre business ;
- `/partners` : rejoindre KoraStay Partners ;
- `/owners` ou `/devenir-proprietaire` : devenir propriétaire ;
- `/about` : à propos ;
- `/contact` : contact ;
- `/faq` : FAQ ;
- `/quality` : charte qualité ;
- `/cancellation-policy` : politique annulation ;
- `/terms` : conditions générales ;
- `/privacy` : confidentialité ;
- `/blog` : blog, phase 2 ;
- `/blog/[slug]` : article, phase 2.

### 13.2 Authentification

- `/login` ;
- `/register` ;
- `/verify-email` ;
- `/forgot-password` ;
- `/reset-password` ;
- `/logout` via action ou endpoint.

### 13.3 Espace voyageur

- `/account` : tableau de bord voyageur ;
- `/account/bookings` ;
- `/account/bookings/[id]` ;
- `/account/favorites` ;
- `/account/profile` ;
- `/account/reviews` ;
- `/account/messages` ;
- `/account/notifications` ;
- `/account/security`.

### 13.4 Espace propriétaire

- `/owner` ;
- `/owner/residences` ;
- `/owner/residences/new` ;
- `/owner/residences/[id]` ;
- `/owner/residences/[id]/edit` ;
- `/owner/residences/[id]/photos` ;
- `/owner/calendar` ;
- `/owner/bookings` ;
- `/owner/bookings/[id]` ;
- `/owner/revenues` ;
- `/owner/reviews` ;
- `/owner/messages` ;
- `/owner/profile`.

### 13.5 Espace partenaire

- `/partner` ;
- `/partner/profile` ;
- `/partner/services` ;
- `/partner/services/new` ;
- `/partner/missions` ;
- `/partner/missions/[id]` ;
- `/partner/calendar` ;
- `/partner/revenues` ;
- `/partner/messages`.

### 13.6 Espace business

- `/business/dashboard` ;
- `/business/requests` ;
- `/business/requests/new` ;
- `/business/requests/[id]` ;
- `/business/team` ;
- `/business/invoices` ;
- `/business/profile`.

### 13.7 Back-office admin

- `/admin` ;
- `/admin/users` ;
- `/admin/users/[id]` ;
- `/admin/residences` ;
- `/admin/residences/[id]` ;
- `/admin/packs` ;
- `/admin/packs/new` ;
- `/admin/packs/[id]/edit` ;
- `/admin/reservations` ;
- `/admin/reservations/[id]` ;
- `/admin/payments` ;
- `/admin/refunds` ;
- `/admin/partners` ;
- `/admin/partners/[id]` ;
- `/admin/business` ;
- `/admin/reviews` ;
- `/admin/messages` ;
- `/admin/content/pages` ;
- `/admin/content/blog` ;
- `/admin/destinations` ;
- `/admin/settings` ;
- `/admin/audit` ;
- `/admin/exports`.

### 13.8 API ou server actions

Préférer Server Actions lorsque pertinent, mais créer API routes pour :

- webhooks de paiement ;
- uploads ;
- endpoints publics nécessaires ;
- recherche dynamique ;
- notifications ;
- exports ;
- health check.

---

## 14. Expérience UI/UX attendue

## 14.1 Direction artistique globale

Le design doit être entièrement repensé. Ne pas reprendre le design du prototype existant.

Objectif visuel :

- premium ;
- moderne ;
- élégant ;
- chaleureux ;
- africain contemporain sans cliché ;
- clair ;
- respirant ;
- adapté marketplace voyage ;
- rassurant pour le paiement et la réservation.

S'inspirer de la qualité UX des meilleures plateformes de voyage, réservation et hospitality :

- Airbnb pour l'expérience mobile, les cartes, la recherche, le détail logement, les favoris ;
- Booking pour la densité d'information utile et les filtres ;
- GetYourGuide pour les packs et activités ;
- Plum Guide / Sonder pour le rendu premium ;
- Linear / Vercel pour la propreté des dashboards connectés.

Ne pas copier leurs éléments protégés. Reproduire uniquement des patterns UX génériques : cartes, barre de recherche, bottom navigation, filtres, galerie, sticky CTA, bottom sheets.

### 14.2 Typographie

Utiliser une police moderne, belle, légèrement arrondie.

Recommandations :

- **Plus Jakarta Sans** ;
- **Nunito Sans** ;
- **Manrope** ;
- **Urbanist** ;
- **Geist** ou **Geist Sans** si disponible ;
- option titre : **Fraunces** ou autre serif moderne uniquement si le rendu reste premium.

Choix recommandé : **Plus Jakarta Sans** pour toute l'application. Elle est moderne, ronde, professionnelle et lisible.

### 14.3 Charte couleur proposée

Même si l'ancien projet avait une charte, le nouveau design doit être refait. Il peut conserver l'esprit premium KoraStay.

Palette recommandée :

```css
--background: #FAF8F4;
--surface: #FFFFFF;
--surface-soft: #F5F1EA;
--text-main: #141217;
--text-muted: #6F6874;
--border: #E8E1D8;
--primary: #5B2EFF;
--primary-dark: #32136B;
--primary-soft: #EEE8FF;
--accent: #F4A742;
--accent-soft: #FFF3DF;
--success: #0F8A5F;
--danger: #E5484D;
--night: #111018;
```

Si le logo KoraStay final contient des couleurs précises, adapter la palette pour rester cohérent avec le logo.

### 14.4 Formes et composants

- Cartes : coins arrondis 20 à 28 px ;
- Boutons : coins arrondis 999 px ou 14 px selon contexte ;
- Badges : pill shape ;
- Inputs : grands, lisibles, arrondis ;
- Ombres : douces, jamais lourdes ;
- Espacements : généreux en desktop, compacts en mobile ;
- Animations : fluides, rapides, subtiles ;
- Icônes : modernes, cohérentes, style line ou filled léger.

### 14.5 Desktop

L'expérience desktop doit être différente de l'expérience mobile.

Desktop attendu :

- header horizontal premium avec logo, navigation, CTA ;
- hero large, immersif, avec recherche centrale ;
- grille de cartes avec espace ;
- filtres latéraux ou top bar selon page ;
- fiche résidence avec galerie large, colonne réservation sticky à droite ;
- dashboards avec sidebar collapsible, layout spacieux, tableaux lisibles ;
- pages admin professionnelles, pas génériques.

### 14.6 Mobile inspiré Airbnb

L'expérience mobile doit être construite comme une expérience à part entière, très inspirée de l'application mobile Airbnb.

Mobile attendu :

- approche mobile-first ;
- header compact ;
- barre de recherche arrondie en haut ;
- catégories horizontales scrollables ;
- cartes verticales avec grandes images ;
- carrousels horizontaux ;
- bottom navigation fixe ;
- onglets : Explorer, Favoris, Réservations, Messages, Profil ;
- filtres sous forme de bottom sheet ;
- calendrier en bottom sheet ;
- sélection voyageurs en bottom sheet ;
- fiche détail avec grande image en haut, bouton retour flottant, cœur favori flottant ;
- CTA réserver sticky en bas ;
- pas de sidebar sur mobile ;
- pas de tables lourdes : transformer en cartes ;
- navigation tactile fluide ;
- menus connectés séparés par rôle ;
- éviter les longs formulaires d'un seul bloc : découper en étapes.

Important : ne pas copier les couleurs, textes, assets ou code d'Airbnb. S'inspirer du modèle UX.

### 14.7 Dashboards connectés

Les espaces admin, propriétaire, partenaire, business et compte voyageur doivent être reharmonisés autour d'un système commun :

- sidebar desktop collapsible ;
- topbar claire ;
- breadcrumbs ;
- cards KPI ;
- tables modernes ;
- filtres visibles ;
- actions rapides ;
- empty states élégants ;
- mobile cards + bottom navigation adaptée ;
- animations sobres ;
- aucun rendu générique type template basique.

---

## 15. Composants UI à créer

### 15.1 Composants publics

- `PublicHeader` ;
- `MobilePublicHeader` ;
- `PublicFooter` ;
- `HeroSearch` ;
- `DestinationSearchInput` ;
- `DateRangePicker` ;
- `GuestSelector` ;
- `StayTypeSelector` ;
- `ResidenceCard` ;
- `PackCard` ;
- `DestinationCard` ;
- `TrustBadge` ;
- `VerifiedBadge` ;
- `PriceDisplay` ;
- `RatingStars` ;
- `FavoriteButton` ;
- `PhotoGallery` ;
- `MobilePhotoCarousel` ;
- `BookingWidget` ;
- `StickyMobileBookingBar` ;
- `FilterDrawer` ;
- `MapPreview` ;
- `ReviewList` ;
- `ReviewForm` ;
- `FAQAccordion`.

### 15.2 Composants connectés

- `ConnectedShell` ;
- `CollapsibleSidebar` ;
- `DashboardTopbar` ;
- `MobileDashboardTabs` ;
- `KpiCard` ;
- `DataTable` ;
- `StatusBadge` ;
- `ActionMenu` ;
- `EmptyState` ;
- `UploadDropzone` ;
- `ImageSortableGrid` ;
- `CalendarAvailabilityManager` ;
- `ReservationTimeline` ;
- `PaymentStatusPanel` ;
- `MessageThread` ;
- `NotificationList` ;
- `AuditLogList`.

### 15.3 Composants formulaires

- `TextField` ;
- `PhoneField` ;
- `EmailField` ;
- `SelectField` ;
- `MultiSelectField` ;
- `TextareaField` ;
- `CurrencyField` ;
- `StepperForm` ;
- `SubmitButton` ;
- `FormError` ;
- `SuccessBanner`.

---

## 16. Modèle de données recommandé

Utiliser PostgreSQL et Prisma.

### 16.1 Enumérations principales

```ts
enum UserRole {
  TRAVELER
  OWNER
  PARTNER
  BUSINESS
  SUPPORT
  ADMIN
  SUPER_ADMIN
}

enum AccountStatus {
  PENDING_EMAIL_VERIFICATION
  ACTIVE
  SUSPENDED
  DISABLED
}

enum PartnerType {
  GUIDE
  TRANSPORT
  RESTAURANT
  ACTIVITY
  OTHER
}

enum VerificationStatus {
  DRAFT
  PENDING_REVIEW
  NEEDS_CHANGES
  VERIFIED
  REJECTED
  SUSPENDED
}

enum ResidenceStatus {
  DRAFT
  PENDING_VALIDATION
  PUBLISHED
  UNPUBLISHED
  SUSPENDED
  ARCHIVED
}

enum QualityLevel {
  ESSENTIAL
  COMFORT
  PREMIUM
}

enum ReservationType {
  RESIDENCE
  PACK
  CUSTOM_PACK
  BUSINESS
}

enum ReservationStatus {
  DRAFT
  PENDING_PAYMENT
  CONFIRMED
  CHECKED_IN
  COMPLETED
  CANCELLATION_REQUESTED
  CANCELLED
  NO_SHOW
  DISPUTED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  EXPIRED
  CANCELLED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum PaymentMethod {
  ORANGE_MONEY
  WAVE
  MTN_MOMO
  CARD
  BANK_TRANSFER
  CASH
  MANUAL
  MOCK
}

enum ReviewStatus {
  PUBLISHED
  HIDDEN
  DELETED
}

enum MessageContextType {
  GENERAL
  RESERVATION
  PACK
  BUSINESS_REQUEST
  SUPPORT_TICKET
}
```

### 16.2 User

Champs :

- `id` ;
- `firstName` ;
- `lastName` ;
- `email` unique ;
- `phone` ;
- `passwordHash` ;
- `role` ;
- `status` ;
- `emailVerifiedAt` ;
- `avatarUrl` ;
- `city` ;
- `country` ;
- `createdAt` ;
- `updatedAt` ;
- `lastLoginAt`.

Relations :

- traveler reservations ;
- owned residences ;
- partner profile ;
- business memberships ;
- favorites ;
- reviews ;
- messages ;
- notifications.

### 16.3 EmailVerificationToken

- `id` ;
- `userId` ;
- `token` unique ;
- `expiresAt` ;
- `usedAt` ;
- `createdAt`.

### 16.4 PasswordResetToken

- `id` ;
- `userId` ;
- `token` unique ;
- `expiresAt` ;
- `usedAt` ;
- `createdAt`.

### 16.5 Destination / City

- `id` ;
- `name` ;
- `slug` unique ;
- `country` ;
- `region` ;
- `description` ;
- `heroImageUrl` ;
- `isActive` ;
- `priority` ;
- `latitude` ;
- `longitude` ;
- `createdAt` ;
- `updatedAt`.

### 16.6 Residence

- `id` ;
- `ownerId` ;
- `cityId` ;
- `slug` unique ;
- `name` ;
- `type` ;
- `shortDescription` ;
- `description` ;
- `country` ;
- `city` ;
- `district` ;
- `address` ;
- `latitude` ;
- `longitude` ;
- `capacity` ;
- `bedrooms` ;
- `beds` ;
- `bathrooms` ;
- `surfaceArea` ;
- `pricePerNight` ;
- `weekendPrice` ;
- `weeklyPrice` ;
- `monthlyPrice` ;
- `cleaningFee` ;
- `depositAmount` ;
- `currency` default `XOF` ;
- `status` ;
- `verificationStatus` ;
- `qualityLevel` ;
- `isVerified` ;
- `badgeLabel` ;
- `checkInTime` ;
- `checkOutTime` ;
- `houseRules` ;
- `cancellationPolicyType` ;
- `createdAt` ;
- `updatedAt` ;
- `publishedAt`.

### 16.7 ResidenceImage

- `id` ;
- `residenceId` ;
- `url` ;
- `altText` ;
- `sortOrder` ;
- `isCover` ;
- `createdAt`.

Règles :

- minimum recommandé : 5 photos ;
- une photo de couverture obligatoire avant publication ;
- interface drag-and-drop ou boutons monter/descendre ;
- suppression possible par owner ou admin.

### 16.8 Amenity

- `id` ;
- `name` ;
- `slug` ;
- `icon` ;
- `category` ;
- `isActive`.

Exemples : WiFi, climatisation, cuisine, parking, eau chaude, télévision, petit déjeuner, ménage, balcon, terrasse, sécurité, groupe électrogène.

### 16.9 ResidenceAmenity

- `id` ;
- `residenceId` ;
- `amenityId` ;
- `details`.

### 16.10 ResidenceAvailabilityBlock

- `id` ;
- `residenceId` ;
- `startDate` ;
- `endDate` ;
- `reason` ;
- `createdById` ;
- `createdAt`.

Utilisé pour blocages manuels.

### 16.11 Reservation

- `id` ;
- `reference` unique, lisible ;
- `type` ;
- `status` ;
- `travelerId` ;
- `residenceId` nullable ;
- `packId` nullable ;
- `businessRequestId` nullable ;
- `startDate` ;
- `endDate` ;
- `nights` ;
- `adults` ;
- `children` ;
- `guestName` ;
- `guestEmail` ;
- `guestPhone` ;
- `subtotalAmount` ;
- `serviceFeeAmount` ;
- `cleaningFeeAmount` ;
- `totalAmount` ;
- `currency` default `XOF` ;
- `notes` ;
- `expiresAt` for pending payment hold ;
- `confirmedAt` ;
- `cancelledAt` ;
- `createdAt` ;
- `updatedAt`.

### 16.12 Payment

- `id` ;
- `reservationId` ;
- `method` ;
- `status` ;
- `amount` ;
- `currency` ;
- `provider` ;
- `providerReference` ;
- `checkoutUrl` ;
- `paidAt` ;
- `failedAt` ;
- `metadata` JSON ;
- `createdAt` ;
- `updatedAt`.

### 16.13 Refund

- `id` ;
- `paymentId` ;
- `reservationId` ;
- `amount` ;
- `reason` ;
- `status` ;
- `processedById` ;
- `processedAt` ;
- `createdAt`.

### 16.14 Pack

- `id` ;
- `destinationId` ;
- `slug` unique ;
- `name` ;
- `subtitle` ;
- `description` ;
- `durationDays` ;
- `durationNights` ;
- `basePersons` ;
- `maxPersons` ;
- `price` ;
- `extraPersonPrice` ;
- `currency` default `XOF` ;
- `status` ;
- `availabilityText` ;
- `meetingPoint` ;
- `startTime` ;
- `physicalLevel` ;
- `clothingRecommendations` ;
- `documentsToBring` ;
- `includedText` ;
- `notIncludedText` ;
- `cancellationPolicy` ;
- `createdAt` ;
- `updatedAt`.

### 16.15 PackImage

- `id` ;
- `packId` ;
- `url` ;
- `altText` ;
- `sortOrder` ;
- `isCover`.

### 16.16 PackIncludedItem

- `id` ;
- `packId` ;
- `label` ;
- `details` ;
- `sortOrder`.

### 16.17 PackProgramDay

- `id` ;
- `packId` ;
- `dayNumber` ;
- `title` ;
- `description` ;
- `sortOrder`.

### 16.18 PackProgramActivity

- `id` ;
- `dayId` ;
- `timeLabel` ;
- `title` ;
- `description` ;
- `sortOrder`.

### 16.19 PartnerProfile

- `id` ;
- `userId` ;
- `type` ;
- `businessName` ;
- `description` ;
- `city` ;
- `zonesCovered` ;
- `phone` ;
- `whatsapp` ;
- `email` ;
- `languages` ;
- `documents` JSON ;
- `verificationStatus` ;
- `ratingAverage` ;
- `createdAt` ;
- `updatedAt`.

### 16.20 PartnerService

- `id` ;
- `partnerProfileId` ;
- `title` ;
- `description` ;
- `city` ;
- `priceFrom` ;
- `currency` ;
- `duration` ;
- `isActive` ;
- `createdAt` ;
- `updatedAt`.

### 16.21 PartnerMission

- `id` ;
- `partnerProfileId` ;
- `reservationId` nullable ;
- `packId` nullable ;
- `title` ;
- `description` ;
- `city` ;
- `scheduledAt` ;
- `status` ;
- `amount` ;
- `currency` ;
- `createdAt` ;
- `updatedAt`.

### 16.22 Favorite

- `id` ;
- `userId` ;
- `residenceId` nullable ;
- `packId` nullable ;
- `createdAt`.

Contrainte : un utilisateur ne peut pas ajouter deux fois le même élément.

### 16.23 Review

- `id` ;
- `authorId` ;
- `reservationId` ;
- `residenceId` nullable ;
- `packId` nullable ;
- `rating` ;
- `cleanlinessRating` ;
- `locationRating` ;
- `valueRating` ;
- `communicationRating` ;
- `comment` ;
- `status` default `PUBLISHED` ;
- `ownerReply` ;
- `createdAt` ;
- `updatedAt`.

### 16.24 BusinessAccount

- `id` ;
- `name` ;
- `organizationType` ;
- `sector` ;
- `contactName` ;
- `email` ;
- `phone` ;
- `city` ;
- `country` ;
- `status` ;
- `createdAt` ;
- `updatedAt`.

### 16.25 BusinessMember

- `id` ;
- `businessAccountId` ;
- `userId` ;
- `role` ;
- `createdAt`.

### 16.26 BusinessRequest

- `id` ;
- `businessAccountId` nullable ;
- `organizationName` ;
- `organizationType` ;
- `sector` ;
- `contactName` ;
- `email` ;
- `phone` ;
- `city` ;
- `country` ;
- `needType` ;
- `missionLocation` ;
- `teamSize` ;
- `startDate` ;
- `endDate` ;
- `budget` ;
- `notes` ;
- `status` ;
- `createdAt` ;
- `updatedAt`.

### 16.27 Conversation

- `id` ;
- `contextType` ;
- `reservationId` nullable ;
- `businessRequestId` nullable ;
- `subject` ;
- `createdAt` ;
- `updatedAt`.

### 16.28 Message

- `id` ;
- `conversationId` ;
- `senderId` ;
- `body` ;
- `readAt` ;
- `createdAt`.

### 16.29 Notification

- `id` ;
- `userId` ;
- `title` ;
- `body` ;
- `type` ;
- `url` ;
- `readAt` ;
- `createdAt`.

### 16.30 ContentPage

- `id` ;
- `slug` ;
- `title` ;
- `body` ;
- `seoTitle` ;
- `seoDescription` ;
- `isPublished` ;
- `createdAt` ;
- `updatedAt`.

### 16.31 BlogPost

- `id` ;
- `slug` ;
- `title` ;
- `excerpt` ;
- `body` ;
- `coverImageUrl` ;
- `authorId` ;
- `isPublished` ;
- `publishedAt` ;
- `createdAt` ;
- `updatedAt`.

### 16.32 AuditLog

- `id` ;
- `actorId` ;
- `action` ;
- `entityType` ;
- `entityId` ;
- `metadata` JSON ;
- `ipAddress` ;
- `createdAt`.

---

## 17. Stack technique recommandée

### 17.1 Application

- Next.js avec App Router ;
- TypeScript strict ;
- React ;
- Tailwind CSS ;
- shadcn/ui ou composants maison de qualité équivalente ;
- Prisma ORM ;
- PostgreSQL, compatible Neon ;
- Auth maison sécurisée ou Auth.js selon choix de Claude Code ;
- Zod pour validation ;
- React Hook Form si formulaires client complexes ;
- date-fns pour dates ;
- Upload local en développement, storage compatible S3/Cloudinary plus tard ;
- Email via Resend ou provider SMTP ;
- Paiement via abstraction provider.

### 17.2 Contraintes de qualité

- TypeScript sans erreurs ;
- build production réussi ;
- lint propre autant que possible ;
- pages protégées par rôle ;
- données validées côté serveur ;
- pas de secrets dans le code ;
- migrations Prisma propres ;
- seed complet ;
- responsive réel ;
- aucun bouton mort sur les parcours principaux ;
- aucun lien important vers une 404 : prévoir page “module en construction” uniquement pour éléments non MVP, mais les parcours listés comme critiques doivent fonctionner.

### 17.3 Fichiers d'environnement

Prévoir :

```env
DATABASE_URL="postgresql://..."
APP_URL="http://localhost:3000"
AUTH_SECRET="..."
EMAIL_FROM="KoraStay <contact@korastay.com>"
RESEND_API_KEY=""
PAYMENT_PROVIDER="mock"
UPLOAD_PROVIDER="local"
NEXT_PUBLIC_APP_NAME="KoraStay"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 17.4 Sécurité

- hachage mot de passe avec bcrypt ou argon2 ;
- sessions sécurisées ;
- protection CSRF si nécessaire ;
- validation serveur de tous les formulaires ;
- contrôle d'accès par rôle côté serveur ;
- pas de confiance dans les données client ;
- rate limiting sur login, register, forgot password ;
- tokens email expirables et à usage unique ;
- journalisation des actions sensibles ;
- pas d'affichage d'informations sensibles ;
- upload sécurisé : type MIME, taille, extension, nom aléatoire ;
- HTTPS en production ;
- conformité données personnelles : accès, rectification, suppression.

### 17.5 Performance

- LCP optimisé sur accueil et fiches ;
- images optimisées ;
- pagination ou infinite loading ;
- cache raisonnable sur contenus publics ;
- pas de requêtes N+1 Prisma ;
- skeleton loaders ;
- pages mobile rapides sur connexion 3G ;
- objectif : page publique chargée en moins de 3 secondes.

### 17.6 SEO

- balises title et meta description ;
- Open Graph ;
- schema.org LodgingBusiness / TouristTrip si possible ;
- sitemap ;
- robots.txt ;
- URLs propres ;
- pages destination indexables ;
- images avec alt text.

### 17.7 Accessibilité

- contraste suffisant ;
- labels visibles ou accessibles ;
- navigation clavier ;
- aria pour dialogues, drawers, menus ;
- focus visible ;
- textes d'erreur explicites ;
- WCAG AA comme objectif.

---

## 18. Seed de données minimum

Créer un seed crédible pour tester tous les parcours.

### 18.1 Utilisateurs

- Super Admin : `admin@korastay.com` ;
- Voyageur : `traveler@korastay.com` ;
- Propriétaire : `owner@korastay.com` ;
- Guide : `guide@korastay.com` ;
- Transporteur : `transport@korastay.com` ;
- Restaurant : `restaurant@korastay.com` ;
- Business : `business@korastay.com`.

Mot de passe de développement commun : `Password123!`.

### 18.2 Destinations

Créer au minimum :

- Daloa ;
- Man ;
- Yamoussoukro ;
- San-Pédro ;
- Korhogo ;
- Bouaké ;
- Abengourou ;
- Grand-Bassam ;
- Assinie ;
- Abidjan.

### 18.3 Résidences

Créer au moins 8 résidences, dont :

1. Lux Résidence - Daloa Lobia 2 ;
2. Studio Confort Centre-ville Daloa ;
3. Appartement T2 Haut-Sassandra ;
4. Villa Familiale Daloa ;
5. Résidence Découverte Man ;
6. Appartement Business Yamoussoukro ;
7. Résidence Port San-Pédro ;
8. Maison Premium Korhogo.

Pour chaque résidence :

- 5 images placeholder de qualité via `/public/placeholders` ;
- équipements ;
- prix ;
- statut publié ;
- badge vérifié pour quelques-unes ;
- qualité Essentiel/Confort/Premium ;
- disponibilité ;
- avis.

### 18.4 Packs

Créer au moins :

- Pack Découverte Daloa ;
- Pack Découverte Man ;
- Pack Découverte Yamoussoukro ;
- Pack Découverte San-Pédro ;
- Pack Découverte Korhogo.

### 18.5 Réservations

Créer :

- réservation confirmée future ;
- réservation passée terminée ;
- réservation en attente de paiement ;
- réservation annulée ;
- réservation pack confirmée ;
- demande business.

### 18.6 Partenaires

Créer :

- 2 guides ;
- 2 transporteurs ;
- 2 restaurants ;
- 1 activité ;
- villes couvertes ;
- services et tarifs indicatifs ;
- statut vérifié.

---

## 19. Fonctionnalités critiques MVP

Claude Code doit construire en priorité un MVP complet mais propre. Les fonctionnalités ci-dessous sont critiques.

### 19.1 Public

- accueil premium ;
- recherche simple ;
- liste résidences ;
- filtres principaux ;
- détail résidence ;
- galerie ;
- réservation résidence ;
- liste packs ;
- détail pack ;
- réservation pack ;
- pages business/partners/contact ;
- responsive desktop/mobile distinct.

### 19.2 Auth

- inscription ;
- connexion ;
- déconnexion ;
- vérification email ;
- reset mot de passe ;
- redirection par rôle ;
- guards.

### 19.3 Voyageur

- dashboard ;
- réservations ;
- favoris ;
- profil ;
- avis ;
- annulation ;
- notifications.

### 19.4 Propriétaire

- dashboard ;
- liste résidences ;
- création/édition résidence ;
- upload photos ;
- gestion calendrier ;
- réservations ;
- revenus basiques ;
- messages basiques.

### 19.5 Partenaire

- dashboard ;
- profil ;
- services ;
- missions ;
- statut validation.

### 19.6 Business

- formulaire public business ;
- dashboard business ;
- demandes ;
- factures placeholder fonctionnel.

### 19.7 Admin

- dashboard ;
- utilisateurs ;
- résidences ;
- validation ;
- packs ;
- réservations ;
- paiements ;
- partenaires ;
- business requests ;
- avis ;
- contenu ;
- audit log.

---

## 20. États et statuts à afficher proprement

### 20.1 Statuts résidence

- Brouillon ;
- En attente de validation ;
- Publiée ;
- Dépubliée ;
- Suspendue ;
- Archivée.

### 20.2 Statuts réservation

- Paiement en attente ;
- Confirmée ;
- Séjour en cours ;
- Terminée ;
- Annulation demandée ;
- Annulée ;
- No show ;
- Litige.

### 20.3 Statuts partenaire

- Brouillon ;
- En attente ;
- Corrections demandées ;
- Vérifié ;
- Refusé ;
- Suspendu.

### 20.4 Statuts paiement

- En attente ;
- En cours ;
- Payé ;
- Échoué ;
- Expiré ;
- Remboursé ;
- Partiellement remboursé.

---

## 21. Contenus de pages publiques

### 21.1 Accueil - structure

1. Header avec logo KoraStay.
2. Hero immersif :
   - titre : `Réservez des résidences vérifiées et vivez des séjours d'exception.`
   - sous-titre : `KoraStay réunit hébergements meublés, packs touristiques et partenaires locaux pour voyager sans incertitude.`
   - barre de recherche : destination, dates, voyageurs, type.
3. Catégories : Résidences, Packs Découverte, Business, Partenaires.
4. Section destinations populaires.
5. Résidences vedettes.
6. Packs Découverte.
7. Pourquoi choisir KoraStay : vérification, paiement mobile, assistance, partenaires locaux.
8. Section Business.
9. Section propriétaires : rejoindre le réseau.
10. Témoignages.
11. FAQ courte.
12. Footer.

### 21.2 Page Résidences

- titre clair ;
- barre recherche ;
- filtres ;
- compteur résultats ;
- tri ;
- cartes ;
- carte optionnelle ;
- empty state si aucun résultat ;
- pagination.

### 21.3 Fiche résidence

Inclure :

- galerie ;
- titre ;
- badge vérifié ;
- ville/quartier ;
- note ;
- capacité ;
- description ;
- équipements ;
- règlement ;
- calendrier ;
- avis ;
- résidences similaires ;
- widget réservation desktop ;
- sticky CTA mobile.

### 21.4 Page Packs

- hero packs ;
- filtres destination, durée, budget, style ;
- cartes packs ;
- section pack personnalisé.

### 21.5 Fiche pack

Inclure :

- image destination ;
- nom ;
- durée ;
- nombre de personnes ;
- prix ;
- inclus ;
- non inclus ;
- programme jour par jour ;
- résidence associée ;
- guide/transport si déterminé ;
- informations pratiques ;
- conditions annulation ;
- CTA réserver.

### 21.6 Page Business

Structure :

- promesse : séjours professionnels fiables, facturables et assistés ;
- bénéfices : facturation, WiFi, assistance, contrat cadre, gestion équipe ;
- formulaire demande ;
- exemples de cas : ONG, entreprise, mission terrain, délégation ;
- CTA.

### 21.7 Page Partners

Structure :

- rejoindre le réseau ;
- choisir type partenaire ;
- bénéfices ;
- standards ;
- formulaire ;
- FAQ.

### 21.8 Page Qualité

Présenter :

- processus de vérification ;
- équipements requis ;
- niveaux Essentiel, Confort, Premium ;
- badge KoraStay vérifié ;
- engagement propriétaire.

---

## 22. Notifications

### 22.1 Types de notifications

- inscription ;
- vérification email ;
- réservation créée ;
- paiement confirmé ;
- paiement échoué ;
- réservation confirmée ;
- réservation annulée ;
- demande remboursement ;
- nouveau message ;
- nouvelle mission partenaire ;
- validation résidence ;
- correction demandée ;
- demande business reçue ;
- rappel check-in ;
- rappel check-out ;
- invitation à laisser avis.

### 22.2 Canaux

- email prioritaire ;
- notification in-app ;
- SMS optionnel ;
- WhatsApp non automatisé au MVP, mais prévoir champ contact.

---

## 23. Messagerie et assistance

Créer une messagerie simple :

- conversation liée à une réservation ou support ;
- messages entre voyageur et support ;
- messages entre voyageur et propriétaire si réservation active ;
- notes internes admin non visibles par voyageur ;
- statut lu/non lu ;
- notifications.

---

## 24. Back-office admin détaillé

### 24.1 Dashboard admin

KPI :

- réservations du mois ;
- revenus estimés ;
- paiements confirmés ;
- résidences publiées ;
- résidences en attente ;
- utilisateurs ;
- partenaires en attente ;
- demandes business ;
- litiges ;
- avis récents.

Graphiques :

- réservations par mois ;
- revenus par mois ;
- répartition par ville ;
- top résidences ;
- top packs.

### 24.2 Gestion utilisateurs

- liste cliquable ;
- recherche ;
- filtres rôle/statut ;
- détail ;
- activation/désactivation ;
- modification rôle par Super Admin ;
- historique.

### 24.3 Gestion résidences

- liste ;
- recherche ;
- filtre ville/statut/qualité ;
- détail ;
- validation ;
- publication ;
- dépublication ;
- suspension ;
- édition ;
- gestion photos ;
- notes internes.

### 24.4 Gestion packs

- liste ;
- création ;
- édition ;
- programme ;
- inclus/non inclus ;
- images ;
- statut ;
- prix.

### 24.5 Gestion réservations

- liste ;
- filtres statut/type/date/ville ;
- détail ;
- paiement ;
- annulation ;
- remboursement ;
- notes ;
- messages ;
- export.

### 24.6 Gestion partenaires

- liste par type ;
- validation ;
- documents ;
- services ;
- missions ;
- suspension.

### 24.7 Gestion business

- demandes ;
- comptes entreprises ;
- devis ;
- factures ;
- notes ;
- suivi.

### 24.8 Contenu

- pages statiques ;
- FAQ ;
- destinations ;
- témoignages ;
- blog phase 2.

### 24.9 Audit

Journaliser :

- connexion admin ;
- changement rôle ;
- validation résidence ;
- annulation réservation ;
- remboursement ;
- suspension compte ;
- suppression contenu ;
- changement paramètres paiement.

---

## 25. Gestion des images

### 25.1 Règles upload

- formats : jpg, jpeg, png, webp ;
- taille maximale configurable ;
- stockage local en développement ;
- prévoir abstraction pour S3/Cloudinary ;
- alt text ;
- image de couverture ;
- tri.

### 25.2 Photos résidences

Minimum 5 photos pour publication recommandée :

- façade ou extérieur ;
- chambre ;
- salon ;
- cuisine ;
- salle de bain ;
- bonus : terrasse, vue, quartier, équipement.

### 25.3 Photos packs

- destination ;
- activité principale ;
- hébergement ;
- guide ou expérience ;
- paysage.

---

## 26. Contenu légal et institutionnel à intégrer

Créer les pages :

- Conditions générales de réservation ;
- Politique d'annulation et remboursement ;
- Charte qualité ;
- Politique de confidentialité ;
- Mentions légales ;
- Conditions partenaires.

Adapter tous les textes StayCI vers KoraStay.

Important : les textes légaux doivent être éditables dans l'admin via `ContentPage`.

---

## 27. Design des cartes

### 27.1 Carte résidence desktop

Éléments :

- grande image ratio 4:3 ;
- cœur favori ;
- badge vérifié ;
- ville/quartier ;
- titre ;
- capacité ;
- nombre de chambres ;
- note ;
- prix par nuit ;
- CTA discret.

### 27.2 Carte résidence mobile

Très inspirée Airbnb :

- image très visible ;
- carousel dots ;
- cœur en haut à droite ;
- titre ;
- ville ;
- note ;
- prix ;
- carte pleine largeur ;
- espace compact ;
- pas de surcharge.

### 27.3 Carte pack

- image destination ;
- badge durée ;
- titre ;
- ville ;
- prix ;
- inclus principaux ;
- CTA.

---

## 28. Responsive behavior

### 28.1 Breakpoints

- mobile : < 768px ;
- tablet : 768-1023px ;
- desktop : >= 1024px ;
- wide : >= 1280px.

### 28.2 Mobile

- bottom navigation obligatoire ;
- filtres en drawer ;
- calendrier en bottom sheet ;
- formulaires en étapes ;
- cards au lieu de tables ;
- sticky CTA ;
- header compact ;
- éviter les modales desktop.

### 28.3 Desktop

- header complet ;
- sidebar connectée ;
- tables ;
- widgets sticky ;
- grands visuels ;
- densité maîtrisée.

---

## 29. Gestion des erreurs et empty states

Prévoir des pages élégantes :

- 404 personnalisée : `Cette page n'est pas encore disponible` avec retour accueil ;
- erreur serveur ;
- résultat de recherche vide ;
- aucune réservation ;
- aucun favori ;
- aucune résidence propriétaire ;
- aucun message ;
- paiement échoué ;
- session expirée ;
- accès non autorisé.

Ne pas laisser l'utilisateur sur une page brute Next.js.

---

## 30. Tests et validation

### 30.1 Tests manuels minimum

Tester :

1. créer compte voyageur ;
2. vérifier email ;
3. se connecter ;
4. rechercher Daloa ;
5. consulter résidence ;
6. ajouter favori ;
7. réserver résidence ;
8. paiement mock réussi ;
9. voir réservation dans espace compte ;
10. annuler réservation ;
11. créer avis après réservation passée ;
12. login propriétaire ;
13. ajouter résidence ;
14. ajouter photos ;
15. bloquer dates ;
16. login admin ;
17. valider résidence ;
18. créer pack ;
19. valider partenaire ;
20. traiter demande business.

### 30.2 Tests techniques

- `npm run build` doit réussir ;
- `npm run lint` si configuré ;
- migrations Prisma appliquées ;
- seed réussi ;
- aucune route critique 404 ;
- rôles bien protégés ;
- pas de crash si image ou services absents ;
- pas de propriété lue sur `undefined` ;
- transactions réservation testées.

---

## 31. Workflow demandé à Claude Code

Claude Code doit travailler comme suit :

1. Lire entièrement ce fichier.
2. Inspecter le repository existant si un repository est fourni.
3. Ne pas reprendre l'ancien design ; refaire l'interface.
4. Construire l'architecture proprement.
5. Créer ou mettre à jour Prisma schema.
6. Créer migrations.
7. Créer seed complet.
8. Construire UI system.
9. Construire pages publiques.
10. Construire auth.
11. Construire réservation et paiement mock.
12. Construire espaces connectés.
13. Construire admin.
14. Ajouter responsive mobile spécifique.
15. Ajouter PWA si possible.
16. Tester build.
17. Corriger erreurs.
18. Documenter les commandes.

### 31.1 Commandes attendues

Prévoir dans le README final :

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
npm run build
```

### 31.2 Priorité de développement

Ordre recommandé :

1. Base projet + thème + layouts ;
2. Prisma schema + seed ;
3. Auth + rôles ;
4. Public pages ;
5. Recherche ;
6. Détail résidence ;
7. Réservation + paiement mock ;
8. Espace voyageur ;
9. Espace propriétaire ;
10. Admin ;
11. Packs ;
12. Partenaires ;
13. Business ;
14. Messagerie + notifications ;
15. Finitions mobile.

---

## 32. Règles de non-régression

- Ne jamais casser la réservation en corrigeant le design.
- Ne jamais supprimer les protections de rôle.
- Ne jamais désactiver les validations serveur.
- Ne jamais créer un formulaire sans message de succès/erreur.
- Ne jamais laisser un utilisateur sans indication après inscription ou action.
- Ne jamais laisser le mobile comme simple réduction du desktop.
- Ne jamais créer une route critique sans contenu.
- Ne jamais mettre en production une intégration paiement fictive sans indication interne claire.

---

## 33. PWA

Prévoir PWA si possible :

- manifest ;
- nom : KoraStay ;
- short name : KoraStay ;
- icons 192 et 512 ;
- theme color aligné marque ;
- installable ;
- offline fallback simple ;
- attention aux pages dynamiques : ne pas servir de données périmées pour réservation.

---

## 34. Internationalisation

Langue principale : français.

Prévoir structure permettant plus tard :

- anglais ;
- éventuellement langues locales ou sous-régionales.

Au MVP, tout peut être en français, mais éviter de coder les textes trop profondément si une structure de traduction simple est facile.

---

## 35. Monnaie et localisation

Monnaie principale : **F CFA / XOF**.

Pays initial : **Côte d'Ivoire**.

Extension future : Afrique de l'Ouest.

Prévoir champs : country, currency, phone country code.

Format prix : `100 000 F CFA` côté interface.

---

## 36. Données de contact de référence

Utiliser en placeholder :

- Email : `contact@korastay.com` ou `contact@korastay.ci` si domaine décidé ;
- Téléphone : `+225 07 57 90 88 84` comme contact historique du projet ;
- Site : à rendre configurable via variables.

---

## 37. Critères d'acceptation finale

La livraison est acceptable si :

1. L'application démarre en local.
2. La base PostgreSQL est fonctionnelle.
3. Le seed crée des données réalistes.
4. Les rôles fonctionnent.
5. Le public peut rechercher, consulter et réserver.
6. Le voyageur peut voir ses réservations et favoris.
7. Le propriétaire peut gérer ses résidences.
8. Le partenaire peut gérer son profil et ses services.
9. Le business peut soumettre et suivre des demandes.
10. L'admin peut superviser utilisateurs, résidences, packs, réservations, paiements, partenaires.
11. Le paiement mock fonctionne.
12. Les emails sont abstraits ou fonctionnels selon clé disponible.
13. Le design desktop est premium.
14. Le mobile est réellement différent et inspiré Airbnb.
15. Les pages légales existent.
16. Les erreurs sont élégantes.
17. `npm run build` réussit.

---

## 38. Résumé ultra-court à placer dans le README

KoraStay est une plateforme ouest-africaine de réservation de résidences meublées vérifiées, de packs touristiques accompagnés et d'hébergements business. Elle connecte voyageurs, propriétaires, partenaires locaux et entreprises autour d'une expérience fiable, mobile-first, moderne et sécurisée. Le MVP comprend catalogue, recherche, réservation, paiement mock, espaces voyageur/propriétaire/partenaire/business et back-office administrateur.

---

## 39. Instruction finale à Claude Code

Construis KoraStay comme une application réelle et fonctionnelle. Ne fais pas une simple maquette. Les boutons principaux doivent mener à de vrais parcours. Les données doivent venir de la base. Les formulaires doivent sauvegarder. Les statuts doivent évoluer. Les espaces connectés doivent être protégés. Le design doit être moderne, premium et cohérent. Le mobile doit être traité comme une expérience autonome, inspirée du modèle Airbnb, avec navigation basse, bottom sheets, cartes compactes, carrousels, recherche tactile et CTA sticky.

Ne reprends pas l'ancien design du prototype. Utilise uniquement la logique métier, les contenus et les parcours décrits ici.
