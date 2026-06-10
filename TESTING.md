# 🧪 Guide de test KoraStay

> Tous les comptes utilisent le **même mot de passe** : `Password123!`
>
> Page de connexion : **http://localhost:3000/login**
> (Les identifiants de démo sont aussi rappelés en bas du formulaire de connexion.)

---

## 🔑 Comptes par type d'utilisateur

| # | Email | Mot de passe | Rôle | Redirigé vers | Statut |
|---|---|---|---|---|---|
| 1 | `admin@korastay.com` | `Password123!` | **Super Admin** | `/admin` | Actif |
| 2 | `traveler@korastay.com` | `Password123!` | **Voyageur** | `/account` | Actif (a déjà des réservations, favoris, avis) |
| 3 | `owner@korastay.com` | `Password123!` | **Propriétaire** | `/owner` | Actif (possède 8 résidences) |
| 4 | `guide@korastay.com` | `Password123!` | **Partenaire — Guide** | `/partner` | Vérifié (Daloa) |
| 5 | `transport@korastay.com` | `Password123!` | **Partenaire — Transport** | `/partner` | Vérifié (Daloa) |
| 6 | `restaurant@korastay.com` | `Password123!` | **Partenaire — Restaurant** | `/partner` | Vérifié (Daloa) |
| 7 | `business@korastay.com` | `Password123!` | **Business** | `/business/dashboard` | Actif (ONG Espoir Plus) |
| 8 | `activite@korastay.com` | `Password123!` | **Partenaire — Activité** | `/partner` | ⏳ En attente de validation |
| 9 | `guide2@korastay.com` | `Password123!` | **Partenaire — Guide** | `/partner` | Vérifié (Man) |
| 10 | `transport2@korastay.com` | `Password123!` | **Partenaire — Transport** | `/partner` | Vérifié (Man) |

> ℹ️ **Astuce** : après connexion, chaque utilisateur est automatiquement redirigé vers son espace selon son rôle. Vous pouvez aussi créer un **nouveau compte voyageur** via `/register` pour tester l'inscription.

---

## 💳 Important — mode démonstration

Le paiement est en **mode mock** : aucun paiement réel, la réservation est **confirmée immédiatement**. Une bannière l'indique au moment du paiement. Vous pouvez donc réserver librement pour tester.

---

## 🧭 Scénarios de test par rôle

### 1. 🌍 Visiteur (sans connexion)
1. Ouvrir l'accueil → utiliser la **barre de recherche** (destination « Daloa »).
2. Filtrer le catalogue `/residences` (ville, type, prix, équipements, vérifiées).
3. Ouvrir une fiche résidence → **galerie**, calendrier, avis.
4. Cliquer **Réserver** → vous êtes redirigé vers la connexion (normal).
5. Consulter un **pack**, la page **Business**, **Partenaires**, **FAQ**, pages légales.
6. Tester en **mobile** (réduire la fenêtre < 768px) : bottom navigation, bottom sheets.

### 2. 👤 Voyageur — `traveler@korastay.com`
1. Se connecter → **tableau de bord** (3 séjours, favoris, avis).
2. **Mes réservations** → ouvrir une réservation confirmée → voir le bon.
3. **Annuler** une réservation à venir → voir le **remboursement estimé**.
4. **Réserver** une résidence (sélectionner dates + voyageurs → payer mock → confirmation).
5. **Favoris** → ajouter/retirer un cœur sur une résidence.
6. **Mes avis** → laisser un avis sur le séjour terminé (Studio Confort).
7. **Profil** / **Sécurité** → modifier les infos, changer le mot de passe.
8. **Notifications** → marquer tout comme lu.

### 3. 🏠 Propriétaire — `owner@korastay.com`
1. Se connecter → **tableau de bord** (KPIs, réservations reçues).
2. **Mes résidences** → ouvrir une fiche → **Modifier** / **Photos** / **Publier-Dépublier**.
3. **Ajouter une résidence** (`/owner/residences/new`) → la soumettre (statut « En attente »).
4. **Photos** → uploader une image (drag & drop), définir la couverture, supprimer.
5. **Calendrier** → bloquer une période, la débloquer.
6. **Revenus** → consulter le détail des gains.
7. **Réservations** → ouvrir le détail d'une réservation reçue.

### 4. 🤝 Partenaire — `guide@korastay.com` (vérifié)
1. Se connecter → **tableau de bord** (services, missions, revenus).
2. **Mes services** → en créer un nouveau, activer/désactiver.
3. **Missions** → accepter/refuser une mission proposée.
4. **Calendrier** / **Revenus** → consulter.
5. **Profil** → modifier les infos.
> Comparez avec `activite@korastay.com` (statut **En attente** → bandeau de validation).

### 5. 🏢 Business — `business@korastay.com`
1. Se connecter → **tableau de bord** (demandes, statuts).
2. **Nouvelle demande** (`/business/requests/new`) → la soumettre.
3. **Mes demandes** → suivre l'avancement (étapes Reçue → Devis → Confirmée).
4. **Équipe**, **Factures**, **Profil**.

### 6. 🛡️ Admin — `admin@korastay.com` (Super Admin)
1. Se connecter → **tableau de bord** (KPIs, réservations par ville, récentes).
2. **Résidences** → filtrer « À valider » → ouvrir « Studio Nouveau Bouaké » → **attribuer un niveau** (Essentiel/Confort/Premium) → **Valider et publier**.
3. **Réservations** → ouvrir une réservation → confirmer / annuler / signaler litige.
4. **Paiements** / **Remboursements** → traiter un remboursement.
5. **Utilisateurs** → suspendre/réactiver, **changer un rôle** (Super Admin).
6. **Partenaires** → valider `activite@korastay.com` (en attente).
7. **Business** → faire évoluer une demande (En traitement → Devis → Confirmée).
8. **Avis** → masquer/supprimer un avis.
9. **Packs** → publier/dépublier.
10. **Contenu** → éditer une page légale → vérifier le rendu public.
11. **Journal d'audit** → voir l'historique des actions.

---

## ✅ Checklist des 20 tests de la spécification

1. Créer un compte voyageur (`/register`)
2. Vérifier l'email (lien loggé dans la **console du serveur** en dev)
3. Se connecter
4. Rechercher « Daloa »
5. Consulter une résidence
6. Ajouter un favori
7. Réserver une résidence
8. Paiement mock réussi
9. Voir la réservation dans l'espace compte
10. Annuler une réservation
11. Créer un avis après une réservation passée
12. Login propriétaire
13. Ajouter une résidence
14. Ajouter des photos
15. Bloquer des dates
16. Login admin
17. Valider une résidence
18. (Admin) Publier/dépublier un pack
19. Valider un partenaire
20. Traiter une demande business

---

## 🔎 Où voir les emails / notifications ?

- **Emails** (vérification, confirmation de réservation…) : affichés dans la **console du serveur** (`npm run dev`), car aucune clé Resend n'est configurée. Cherchez `[EMAIL simule]`.
- **Notifications in-app** : cloche en haut à droite des espaces connectés + page `/account/notifications`.

---

## 🔁 Réinitialiser les données de test

```bash
npm run db:setup
```
Recrée une base propre avec toutes les données de démonstration ci-dessus.
