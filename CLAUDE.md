# CLAUDE.md — PassSanté / MVP Assistant IA Hospitalier

Ce fichier guide Claude Code et tous les membres de l'équipe. À lire avant toute modification.

## 1. Projet
- Prototype de plateforme hospitalière : espace professionnel, espace patient, administration, assistant IA (RAG).
- **Mode démonstration (Option A)** : rôles simulés (mock) via un sélecteur de rôle. Firebase Auth est en "Could" (branche `feat/m1-firebase-auth`, fusion seulement si stable mercredi 14 au soir).
- **Données fictives uniquement.** Le bandeau « Données de démonstration — aucune information réelle » reste affiché en permanence.
- Livraison : démo vendredi 16 octobre 2026, gel de `main` jeudi 15, tag `v1.0` vendredi.

## 2. Stack
- Next.js 16 (App Router, Turbopack), React, TypeScript strict.
- Polices via `next/font` (Inter, Plus Jakarta Sans). Styles dans `styles/globals.css`.
- Firebase (Auth, Firestore, Storage) : optionnel, non requis pour le MVP.
- Assistant IA : appels côté serveur uniquement (`app/api/assistant`, `lib/rag`).

## 3. Arborescence et propriétaires
| Dossier | Contenu | Propriétaire |
|---|---|---|
| `lib/rbac.ts`, `lib/audit.ts`, `lib/role-context.tsx` | Rôles, permissions, journal d'audit, rôle courant | M1 Sidickk |
| `components/admin/`, `app/admin/` | Utilisateurs, rôles, journaux d'audit | M1 Sidickk |
| `app/patients/`, patients et dossier dans `components/layout/pass-sante-app.tsx` | Patients, dossier médical | M2 Nethania |
| `components/ui/`, `components/patient/`, `app/espace-patient/`, RDV (`components/staff/`) | Design system, RDV, espace patient | M3 Merval |
| `app/assistant/`, `app/api/assistant/`, `lib/rag/` | Assistant IA | M4 Mira |
| `data/` | Données de démonstration (`mock-data`, `dates`, `vital-limits`) | M2 + M4 |
| `types/index.ts` | Modèle de données partagé | Figé, modifications en PR courte |

Fichiers partagés (`types/index.ts`, `package.json`, `CLAUDE.md`, `components/layout/pass-sante-app.tsx`) : modifier rarement, PR courte, annoncer dans le canal d'équipe.

## 4. Rôles et permissions (RBAC simulé)
Rôles : `medecin`, `infirmier`, `secretaire`, `labo`, `patient`, `admin`.
Fonction centrale : `can(role, action, resource)` dans `lib/rbac.ts`.
- Actions : `read`, `create`, `update`.
- Ressources : `patients`, `dossier`, `rdv`, `assistant`, `logs`.

| Rôle | patients | dossier | rdv | assistant | logs |
|---|---|---|---|---|---|
| medecin | read, create, update | read, create, update | read, create | read | — |
| infirmier | read | read, update | read | read | — |
| secretaire | read, create, update | — | read, create | — | — |
| labo | read | read, update | — | — | — |
| patient | — | read | read | read | — |
| admin | read | — | — | — | read |

La matrice est un brouillon à figer en équipe (BF-003). Toute modification de la matrice alimente l'interface, l'isolation et le RAG : elle passe en PR et est annoncée.

### Isolation patient (BF-061)
- `canAccessPatient(role, patientId)` : un patient ne voit que `DEMO_PATIENT_ID` (`PS-2024-0812`, Aminata Mensah).
- Une tentative d'accès à un autre dossier affiche « Accès refusé » et écrit une ligne `Refusé` dans le journal.

### Rôle courant
- `RoleProvider` (dans `app/layout.tsx`, imbriqué dans `SessionProvider`) et hook `useRole()`.
- `useRole()` s'utilise **uniquement dans un composant client**, jamais dans `app/layout.tsx` ni au niveau d'un module.
- Le rôle et le journal sont en mémoire : un rechargement de page les réinitialise.

## 5. Journal d'audit
- `logAction(role, action, resource, targetId?, allowed = true)` dans `lib/audit.ts`.
- `getLogs()` alimente `AdminAuditLogs` (fusionné avec les journaux fictifs).
- À appeler sur toute action sensible : création de patient, lecture de dossier refusée, création de RDV, question à l'assistant.

## 6. Règles de sécurité
- Aucune clé secrète dans le dépôt. `.env` et `.env.local` sont ignorés ; `.env.example` ne contient que les noms de variables.
- Les clés IA restent côté serveur (jamais `NEXT_PUBLIC_`).
- Ne jamais envoyer de données patient réelles à un outil d'IA.
- Le RAG filtre par permissions **avant** la récupération (NF-10) en réutilisant `lib/rbac`.
- L'IA ne pose pas de diagnostic (NF-14), cite ses sources (BF-043), affiche « aucune information trouvée » (BF-044) et sépare visuellement contenu dossier / contenu IA (NF-09).

## 7. Conventions de code
- TypeScript sans erreur : `npx tsc --noEmit` doit passer avant chaque commit.
- Alias d'import `@/` pour la racine du projet.
- Composants interactifs : `"use client"` en première ligne.
- Interface en français ; dates via `data/dates.ts`.
- Pas de nouvelle dépendance sans en parler à l'équipe.

## 8. Git
- Une branche par carte Trello : `feat/m1-...`, `fix/m1-...`. Jamais de commit direct sur `main`.
- Commits : `feat(rbac): description (BF-060)`.
- Une PR par carte, relue par un autre membre, puis « Squash and merge ».
- Avant une PR : `git fetch && git merge origin/main`.
- Lancer Claude Code sur sa propre branche, relire `git diff` avant chaque commit.
- Gel de `main` le jeudi 15 octobre : seuls les correctifs passent.

## 9. Definition of Done
1. `tsc` passe, fusion sur `main` via PR relue.
2. Testé à la main avec au moins deux rôles, dont un sans droit.
3. Actions sensibles journalisées avec `logAction()`.
4. Aucune donnée réelle, aucune clé dans le dépôt.
5. Critères d'acceptation cochés, carte démontrable.

## 10. Commandes
```bash
npm install          # installer
npm run dev          # lancer en local (http://localhost:3000)
npx tsc --noEmit     # vérifier les types
```
