# 🏋️ FitTracker — Application Fitness Complète

Une application web moderne pour suivre tes entraînements, ton alimentation et tes habitudes quotidiennes.

---

## 📁 Structure du projet

```
fittracker/
├── backend/                     # API Node.js / Express
│   ├── models/
│   │   ├── User.js              # Schéma utilisateur + calcul calorique
│   │   ├── Workout.js           # Séances d'entraînement
│   │   ├── FoodLog.js           # Journal alimentaire
│   │   └── Task.js              # Habitudes + streaks
│   ├── routes/
│   │   ├── auth.js              # Inscription / connexion / profil
│   │   ├── workouts.js          # CRUD séances
│   │   ├── food.js              # CRUD journal alimentaire
│   │   ├── tasks.js             # CRUD habitudes + completion
│   │   └── profile.js           # Mise à jour du profil
│   ├── middleware/
│   │   └── auth.js              # Vérification JWT
│   ├── server.js                # Entrée principale
│   ├── package.json
│   └── .env.example
│
└── frontend/                    # React + Vite + Tailwind
    ├── src/
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx    # Vue d'ensemble
    │   │   ├── WorkoutsPage.jsx     # Entraînements
    │   │   ├── FoodPage.jsx         # Journal alimentaire
    │   │   ├── TasksPage.jsx        # Habitudes quotidiennes
    │   │   └── ProfilePage.jsx      # Profil + paramètres
    │   ├── components/
    │   │   └── layout/
    │   │       └── Layout.jsx       # Sidebar + navigation
    │   ├── services/
    │   │   └── api.js               # Instance Axios configurée
    │   ├── store/
    │   │   └── authStore.js         # Zustand (auth global)
    │   ├── App.jsx                  # Routing principal
    │   ├── main.jsx
    │   └── index.css                # Tailwind + classes custom
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Démarrage rapide

### Prérequis
- **Node.js** >= 18
- **MongoDB** (local ou [MongoDB Atlas](https://cloud.mongodb.com) gratuit)

---

### 1. Backend

```bash
cd fittracker/backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# → Édite .env avec ton URI MongoDB et ton JWT_SECRET

# Démarrer le serveur de développement
npm run dev
# → Serveur sur http://localhost:5000
```

**Variables d'environnement (.env) :**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fittracker
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

> 💡 Pour MongoDB Atlas : remplace MONGO_URI par ton URI de connexion Atlas.

---

### 2. Frontend

```bash
cd fittracker/frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
# → App sur http://localhost:5173
```

---

## ✨ Fonctionnalités

### 🏋️ Entraînements
- Créer des séances avec titre, type, date, durée
- Ajouter des exercices avec séries / reps / poids
- Voir l'historique complet
- Graphique d'activité (14 derniers jours)
- Emoji de ressenti post-séance

### 🍽️ Journal alimentaire
- Navigation jour par jour
- 4 repas : petit-déjeuner, déjeuner, dîner, snack
- Suivi des macros (calories, protéines, glucides, lipides)
- Barre de progression vers l'objectif calorique

### ✅ Habitudes quotidiennes
- Créer des habitudes avec icône, objectif, unité
- Suggestions prêtes à l'emploi (eau, pas, sport...)
- Système de streaks (jours consécutifs)
- Badges automatiques (7j, 30j, assidu)
- Progression visuelle

### 📊 Dashboard
- Vue d'ensemble journalière
- Stats : séances, calories, habitudes, streak
- Graphique d'activité recharts
- Badges obtenus

### 👤 Profil
- Données physiques : poids, taille, âge, genre
- Objectif : perte de poids / prise de muscle / maintien
- Niveau d'activité (5 niveaux)
- Calcul automatique des besoins caloriques (Mifflin-St Jeor)
- Mode sombre
- Collection de badges

---

## 🛠️ Choix techniques

| Domaine | Technologie | Pourquoi |
|---------|-------------|----------|
| Frontend framework | React 18 | Écosystème riche, hooks modernes |
| Build tool | Vite | Ultra-rapide, HMR instantané |
| Styles | Tailwind CSS v3 | Utility-first, dark mode natif |
| State global | Zustand | Léger, simple, persistance |
| Formulaires | React Hook Form | Performant, pas de re-renders inutiles |
| Graphiques | Recharts | Composants React, léger |
| Routage | React Router v6 | Standard de facto |
| Backend | Express.js | Minimaliste, rapide à mettre en place |
| ORM | Mongoose | Schémas + validation MongoDB |
| Auth | JWT + bcrypt | Stateless, sécurisé |
| Validation | express-validator | Middleware de validation |

---

## 🔌 API Endpoints

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil courant |

### Entraînements
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/workouts` | Liste (paginée) |
| GET | `/api/workouts/stats` | Statistiques |
| POST | `/api/workouts` | Créer |
| PUT | `/api/workouts/:id` | Modifier |
| DELETE | `/api/workouts/:id` | Supprimer |

### Alimentation
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/food?date=YYYY-MM-DD` | Repas d'un jour |
| POST | `/api/food` | Ajouter un repas |
| PUT | `/api/food/:id` | Modifier |
| DELETE | `/api/food/:id` | Supprimer |

### Habitudes
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/tasks` | Liste + statut du jour |
| POST | `/api/tasks` | Créer |
| POST | `/api/tasks/:id/complete` | Cocher |
| POST | `/api/tasks/:id/uncomplete` | Décocher |
| DELETE | `/api/tasks/:id` | Supprimer (soft delete) |

---

## 🚀 Déploiement

### Frontend — Vercel
```bash
cd frontend
npm run build
# Déployer le dossier dist/ sur Vercel
```

### Backend — Railway / Render
```bash
cd backend
# Configurer les variables d'environnement dans le dashboard
# Déployer via GitHub ou CLI
```

---

## 🔜 Améliorations possibles

1. **Export des données** — CSV / PDF de l'historique
2. **Notifications push** — Rappels via Web Push API
3. **Templates d'entraînement** — Programmes prédéfinis PPL, Full Body...
4. **Historique du poids** — Courbe d'évolution avec graphique
5. **Bibliothèque d'exercices** — Base de données partagée
6. **Social** — Partage de séances, classements
7. **Electron** — Packaging desktop avec `electron-vite`
8. **PWA** — Mode offline avec Service Worker
9. **IA** — Suggestions de repas ou d'entraînements personnalisés
10. **Photos** — Suivi de la progression visuelle

---

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (salt rounds : 12)
- JWT avec expiration (7 jours par défaut)
- Middleware d'authentification sur toutes les routes protégées
- Validation des entrées côté serveur (express-validator)
- CORS configuré pour autoriser uniquement le client
- Isolation des données : chaque utilisateur ne voit que ses propres données

---

Fait avec ❤️ — Stack : React · Node.js · MongoDB · Tailwind CSS
