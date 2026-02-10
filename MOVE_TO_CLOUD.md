# Stratégie de Migration vers le Cloud ("Move to Cloud")

Ce document détaille la stratégie complète pour migrer l'application SpeedyWiki vers le cloud, en assurant la scalabilité, la résilience et la facilité de maintenance.

## 1. Analyse de l'existant

L'application est composée de :
- **Frontend** : React (Vite)
- **Backend API/Proxy** : Node.js (Express)
- **Backend WebSocket** : Node.js (ws)
- **Base de données** : MongoDB Atlas (Déjà dans le cloud ✅)

### Points bloquants actuels pour le Cloud :
1. **État en mémoire (Stateful)** : Le serveur WebSocket (`websocket.js`) stocke l'état des lobbies (`const lobbies = {}`) en mémoire RAM locale. Si l'application redémarre ou si on lance plusieurs instances pour gérer plus de joueurs, les données sont perdues ou incohérentes.
2. **Valeurs codées en dur (Hardcoded Values)** : De nombreuses références à `localhost`, `3001`, `3002` sont présentes dans le code source.
3. **Absence de gestion de configuration centralisée** : La configuration est dispersée.

---

## 2. Stratégie de Migration

Nous adopterons une approche **Container-First** sur une plateforme PaaS (Platform as a Service) ou CaaS (Container as a Service) pour simplifier le déploiement.

### Architecture Cible
- **Frontend** : Hébergé sur un CDN ou service de fichiers statiques (Vercel, Netlify, AWS S3+CloudFront, ou conteneur Nginx).
- **Backends** : Conteneurisés (Docker).
    - *Option A (Simple)* : 1 seul conteneur regroupant API + WebSocket (nécessite fusion des serveurs).
    - *Option B (Robuste)* : 2 services distincts (API et WebSocket).
- **State Store (Redis)** : Pour stocker l'état des lobbies et permettre la scalabilité horizontale (plusieurs serveurs WebSocket partageant les mêmes données).
- **Database** : MongoDB Atlas (inchangé).

---

## 3. Étapes Chronologiques de Migration

### Phase 1 : Préparation & "Cloud Readiness" (Code)
*Objectif : Rendre le code agnostique de l'environnement.*

1. **Centraliser la Configuration** :
   - Remplacer tous les `localhost` et ports en dur par des variables d'environnement (`process.env.PORT`, `import.meta.env.VITE_API_URL`, etc.).
   
2. **Stateless WebSocket (Recommandé)** :
   - Migrer l'objet `lobbies` de la mémoire locale vers un store rapide comme **Redis**.
   - Cela permet de redémarrer le serveur sans perdre les parties en cours.

3. **Homogénéisation Docker** :
   - S'assurer que les `Dockerfile` sont optimisés pour la production (multi-stage builds pour réduire la taille).

### Phase 2 : Infrastructure & CI/CD
*Objectif : Automatiser le déploiement.*

1. **Choix du Provider** : 
   - *Recommandation* : Railway, Render, ou DigitalOcean App Platform (simplifie la gestion des WebSockets et du HTTPS).
   
2. **Mise en place du Pipeline CI/CD** (GitHub Actions / GitLab CI) :
   - Build des images Docker.
   - Tests automatisés.
   - Push vers un Container Registry.

### Phase 3 : Déploiement
1. Provisionner une instance **Redis** (gérée par le provider).
2. Déployer le **Backend** (API + WS) en connectant les variables d'environnement.
3. Déployer le **Frontend** avec les variables d'environnement pointant vers l'URL publique du backend (HTTPS).

---

## 4. Modifications de Code Requises

Voici les fichiers spécifiques et les lignes à modifier pour rendre l'application "Cloud Native".

### A. Frontend (`site/`)

#### 1. `site/src/components/game/WikiContentWindow.tsx`
Le proxy est codé en dur sur `localhost:3001`.
- **Lignes 85-87** :
```typescript
// AVANT
const defaultOrigin = `${window.location.protocol}//${window.location.hostname}:3001`;
const proxyOrigin = import.meta.env.VITE_PROXY_ORIGIN || defaultOrigin;

// APRÈS (Utiliser une variable d'environnement pour l'URL complète)
const proxyOrigin = import.meta.env.VITE_API_URL || "http://localhost:3001";
```

#### 2. `site/src/components/WSContext.tsx`
L'URL WebSocket est déduite du hostname mais le port est fixe.
- **Lignes 80-82** :
```typescript
// AVANT
const host = window.location.hostname;
const defaultWsScheme = window.location.protocol === "https:" ? "wss" : "ws";
const socketUrl = import.meta.env.VITE_WS_URL || `${defaultWsScheme}://${host}:3002`;

// APRÈS (Mieux gérer la production sans port explicite si derrière un load balancer)
const socketUrl = import.meta.env.VITE_WS_URL || (window.location.hostname === "localhost" 
    ? "ws://localhost:3002" 
    : `wss://${window.location.host}/ws`); // Exemple de routage
```

### B. Backend (`backend/`)

#### 1. `backend/server.js` (API Proxy)
- **Ligne 6** : `const PORT = 3001;` -> `const PORT = process.env.PORT || 3001;`
- **Ligne 89** : `http://localhost:${PORT}` -> Doit utiliser une variable `PUBLIC_URL` ou relative.

#### 2. `backend/websocket.js` (Moteur de Jeu)
C'est la partie la plus critique.
- **Ligne 12** : `port: 3002` -> `port: process.env.PORT || 3002` (Attention aux conflits si API et WS tournent sur le même host sans conteneurs séparés).
- **Ligne 26** : `const lobbies = {};` 
   - **Problème** : Si l'hébergeur redémarre le service (fréquent en cloud), toutes les parties sont perdues.
   - **Solution** : Utiliser Redis.
   
   *Exemple de refactoring (pseudo-code) :*
   ```javascript
   // Au lieu de :
   lobbies[lobbyId] = { ... };
   
   // Faire :
   await redisClient.set(`lobby:${lobbyId}`, JSON.stringify(lobbyData));
   ```

#### 3. CORS & Sécurité (`backend/server.js`)
- **Ligne 28** : `app.use(cors());` 
   - En production, il faut restreindre les origines autorisées :
   ```javascript
   app.use(cors({
       origin: process.env.FRONTEND_URL || "http://localhost:4173"
   }));
   ```

## 5. Résumé des Variables d'Environnement à Créer

| Variable | Service | Description |
|----------|---------|-------------|
| `PORT` | Backend | Port d'écoute (souvent imposé par le provider cloud) |
| `MONGO_URI` | Backend | URL de connexion MongoDB Atlas |
| `REDIS_URL` | Backend | URL de connexion Redis (pour les sessions/lobbies) |
| `FRONTEND_URL` | Backend | URL du site pour CORS |
| `VITE_API_URL` | Frontend | URL HTTP du backend |
| `VITE_WS_URL` | Frontend | URL WebSocket du backend |

