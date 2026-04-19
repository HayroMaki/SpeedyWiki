# Migration Cloud de SpeedyWiki - Rapport Post-Mortem

Ce document retrace la migration complète de SpeedyWiki vers AWS, incluant les problèmes rencontrés, les solutions appliquées, et l'architecture finale déployée.

---

## 1. État Initial

### Architecture Locale
- **Frontend** : React (Vite) sur `localhost:4173`
- **Backend API** : Express (proxy Wikipedia) sur `localhost:3001`
- **Backend WebSocket** : Node.js (ws) sur `localhost:3002`
- **Base de données** : MongoDB Atlas (déjà cloud-native ✅)

### Problèmes Identifiés
1. **Hardcoded URLs** : Références à `localhost` et ports fixes dans le code
2. **État en mémoire** : Lobbies stockés dans `const lobbies = {}` (perte de données au redémarrage)
3. **Pas de scalabilité** : Impossible de lancer plusieurs instances WebSocket
4. **Secrets en clair** : Credentials MongoDB et Redis dans les scripts de déploiement

---

## 2. Architecture Cible (Réalisée)

### Services Déployés
```
┌──────────────────────────────────────────────┐
│                  AWS Cloud                   │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │  App Runner      │  │  App Runner      │  │
│  │  speedywiki-site │  │  speedywiki-api  │  │
│  │  (Frontend)      │  │  (Proxy API)     │  │
│  │  eu-west-1       │  │  eu-west-1       │  │
│  └──────────────────┘  └──────────────────┘  │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │  Lightsail Container Service             │ │
│ │  speedywiki-ws-service                   │ │
│ │  (WebSocket Engine)                      │ │
│ │  eu-west-1                               │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
     │                                │
┌────▼─────┐                  ┌───────▼────────┐
│ MongoDB  │                  │ Redis Cloud    │
│  Atlas   │                  │ (State Store)  │
└──────────┘                  └────────────────┘
```

### Choix Techniques
- **Frontend & API** : AWS App Runner (gestion automatique HTTPS, scaling, health checks)
- **WebSocket** : AWS Lightsail Container Service (support natif WebSocket sans proxy Envoy)
- **State Store** : Redis Cloud (lobbies, players, game state partagé entre instances)
- **Container Registry** : AWS ECR (eu-west-3) pour API/Frontend, Lightsail Registry pour WebSocket

---

## 3. Chronologie de la Migration

### Phase 1 : Préparation du Code (Cloud-Ready)

#### 1.1 Externalisation des Variables d'Environnement
**Fichiers modifiés** :
- `backend/server.js` : Ajout de `process.env.PORT` et `process.env.PUBLIC_URL`
- `backend/websocket.js` : Ajout de `process.env.WS_PORT`
- `site/src/components/WikiContentWindow.tsx` : Utilisation de `import.meta.env.VITE_API_URL`
- `site/src/components/WSContext.tsx` : Utilisation de `import.meta.env.VITE_WS_URL`

**Création de** :
- `site/.env.production` : Variables pour le build de production
- `backend/.env` : Variables pour développement local

#### 1.2 Adaptation des Serveurs pour le Cloud
**Modifications critiques** :
```javascript
// backend/server.js & websocket.js
server.listen(PORT, '0.0.0.0', () => { ... });
// Binding sur 0.0.0.0 au lieu de localhost pour accepter les connexions externes
```

**WebSocket Upgrade Handling** :
```javascript
// backend/websocket.js
const websocket = new WebSocketServer({ noServer: true });
server.on('upgrade', (request, socket, head) => {
  websocket.handleUpgrade(request, socket, head, (ws) => {
    websocket.emit('connection', ws, request);
  });
});
```

### Phase 2 : Tentative de Déploiement sur App Runner

#### 2.1 Déploiement Initial
**Actions** :
- Création des Dockerfiles pour backend et frontend
- Push des images vers AWS ECR (eu-west-3)
- Déploiement de 3 services App Runner :
  - `speedywiki-site` (Frontend)
  - `speedywiki-api` (Backend API)
  - `speedywiki-ws` (WebSocket) ❌

#### 2.2 Problème Critique : WebSocket 426 Upgrade Required

**Symptôme** :
```
WebSocket connection to 'wss://xxx.eu-west-1.awsapprunner.com' failed: 
Error during WebSocket handshake: Unexpected response code: 426
```

**Cause Racine** :
AWS App Runner utilise un proxy Envoy qui ne gère pas correctement les connexions WebSocket persistantes. Le proxy bloque ou rejette les requêtes `Upgrade: websocket`.

**Recherche & Diagnostic** :
- Analyse de la documentation AWS App Runner
- Tests avec différentes configurations de headers
- Conclusion : **App Runner n'est pas adapté aux WebSockets**

### Phase 3 : Migration WebSocket vers Lightsail

#### 3.1 Choix de Lightsail Container Service
**Raisons** :
- Support natif des WebSockets (pas de proxy Envoy)
- Load balancer compatible avec les connexions persistantes
- Coût prévisible et simple à gérer

#### 3.2 Création du Script de Déploiement
**Fichier** : `deploy-ws.ps1` (renommé depuis `deploy-ws-lightsail.ps1`)

**Spécificités Lightsail** :
- Push d'image via `aws lightsail push-container-image` (plugin lightsailctl)
- Configuration JSON pour le déploiement (containers, ports, environment, healthCheck)
- Parsing manuel de la sortie texte (pas de JSON natif)

**Résultat** : ✅ WebSocket fonctionnel sur `wss://speedywiki-ws-service.3ea2an7j8mje0.eu-west-1.cs.amazonlightsail.com`

### Phase 4 : Intégration Redis pour la Scalabilité

#### 4.1 Problème : État en Mémoire
**Avant** :
```javascript
const lobbies = {}; // Perdu au redémarrage ou entre instances
```

**Conséquences** :
- Perte des parties en cours lors d'un redémarrage
- Impossible de scaler horizontalement (plusieurs instances)

#### 4.2 Solution : Redis Cloud
**Configuration** :
- Host : `redis-18676.c3.eu-west-1-1.ec2.cloud.redislabs.com`
- Port : `18676`
- Credentials : Stockés dans `.env` (sécurisé)

**Refactoring de `backend/websocket.js`** :
```javascript
// 3 clients Redis
const redisClient = createClient(redisConfig);  // Data operations
const pubClient = createClient(redisConfig);    // Publishing
const subClient = createClient(redisConfig);    // Subscribing

// État partagé via Redis
await redisClient.hSet(`lobby:${lobbyId}`, { isReady, articles, ... });
await redisClient.sAdd(`lobby:${lobbyId}:players`, playerJson);

// Pub/Sub pour broadcast multi-instances
await pubClient.publish('speedywiki:events', JSON.stringify({ lobbyId, payload }));
```

**Architecture** :
- `localConnections` : Map des connexions WebSocket locales à cette instance
- Redis : Source de vérité pour l'état du jeu (lobbies, players, winners)
- Pub/Sub : Synchronisation des messages entre instances

### Phase 5 : Sécurisation des Secrets

#### 5.1 Problème : Credentials Hardcodés
**Avant** :
```powershell
# deploy-ws.ps1
"MONGO_URI" = "mongodb+srv://user:pass@cluster.mongodb.net/"
```

**Risque** : Secrets commités dans Git

#### 5.2 Solution : Fichier `.env` Centralisé
**Création de** : `.env` à la racine du projet
```env
MONGO_URI=mongodb+srv://jules:***@cluster.mongodb.net/
REDIS_USERNAME=speedywiki
REDIS_PASSWORD=***
REDIS_HOST=redis-18676.c3.eu-west-1-1.ec2.cloud.redislabs.com
REDIS_PORT=18676
WS_PORT=3002
```

**Modification de `deploy-ws.ps1`** :
```powershell
# Lecture dynamique du .env
$envParams = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^\s*([^#=]+)\s*=\s*(.*)") {
        $envParams[$matches[1].Trim()] = $matches[2].Trim()
    }
}

# Injection dans le container
environment = @{
    "MONGO_URI" = $envParams["MONGO_URI"]
    "REDIS_USERNAME" = $envParams["REDIS_USERNAME"]
    ...
}
```

**Ajout à `.gitignore`** :
```
.env
lightsail-deploy-config.json
```

### Phase 6 : Résolution des Déconnexions WebSocket

#### 6.1 Problème : Connexions Fermées Inopinément
**Symptôme** :
```
⚠️ WebSocket Closed : (raison vide)
```

**Cause** :
Le load balancer Lightsail ferme les connexions inactives après ~30 secondes sans trafic.

#### 6.2 Solution : Heartbeat (Ping/Pong)
**Implémentation dans `backend/websocket.js`** :
```javascript
function heartbeat() {
  this.isAlive = true;
}

websocket.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ...
});

// Ping toutes les 25 secondes
const interval = setInterval(function ping() {
  websocket.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 25000);
```

**Résultat** : ✅ Connexions stables, pas de déconnexions intempestives

---

## 4. Scripts de Déploiement Créés

### 4.1 Scripts Individuels
- **`deploy-site.ps1`** : Déploiement du frontend sur App Runner
- **`deploy-api.ps1`** : Déploiement de l'API sur App Runner
- **`deploy-ws.ps1`** : Déploiement du WebSocket sur Lightsail
- **`check-deployments.ps1`** : Vérification du statut des 3 services

### 4.2 Script Global
- **`deploy.ps1`** : Déploiement complet (ECR login + 3 services)

### 4.3 Workflow
```powershell
# Déploiement complet
.\deploy.ps1

# Déploiement ciblé (ex: WebSocket uniquement)
.\deploy-ws.ps1

# Vérification du statut
.\check-deployments.ps1
```

---

## 5. Configuration Finale

### 5.1 Variables d'Environnement

#### Backend (App Runner & Lightsail)
| Variable | Valeur | Usage |
|----------|--------|-------|
| `PORT` | `3001` (API) / `3002` (WS) | Port d'écoute |
| `PUBLIC_URL` | URL App Runner API | Réécriture des liens proxy |
| `MONGO_URI` | `mongodb+srv://...` | Connexion MongoDB Atlas |
| `REDIS_USERNAME` | `speedywiki` | Auth Redis |
| `REDIS_PASSWORD` | `***` | Auth Redis |
| `REDIS_HOST` | `redis-18676.c3...` | Host Redis Cloud |
| `REDIS_PORT` | `18676` | Port Redis |
| `WS_PORT` | `3002` | Port WebSocket |

#### Frontend (Build-time)
| Variable | Valeur | Usage |
|----------|--------|-------|
| `VITE_API_URL` | URL App Runner API | Endpoint proxy Wikipedia |
| `VITE_WS_URL` | URL Lightsail WS | Endpoint WebSocket |

### 5.2 Fichiers de Configuration
- `.env` : Secrets (non commité)
- `site/.env.production` : Variables de build frontend
- `backend/.env` : Variables de développement local

---

## 6. Problèmes Résolus

| Problème | Solution | Fichier/Service |
|----------|----------|-----------------|
| WebSocket 426 sur App Runner | Migration vers Lightsail | `deploy-ws.ps1` |
| État perdu au redémarrage | Redis pour state store | `backend/websocket.js` |
| Secrets dans Git | Fichier `.env` + `.gitignore` | `.env`, `deploy-ws.ps1` |
| Déconnexions intempestives | Heartbeat ping/pong (25s) | `backend/websocket.js` |
| URLs hardcodées | Variables d'environnement | Tous les fichiers |
| Pas de scalabilité | Redis Pub/Sub | `backend/websocket.js` |

---

## 7. Architecture Redis Finale

### 7.1 Structure des Clés
```
lobby:{lobbyId}          -> Hash { id, isReady, articles, Startarticle, winners }
lobby:{lobbyId}:players  -> Set  [ {pseudo, image}, ... ]
```

### 7.2 Flux de Données
```
Client A (Instance 1)  →  WebSocket Server 1  →  Redis Pub/Sub
                                                       ↓
Client B (Instance 2)  ←  WebSocket Server 2  ←  Redis Pub/Sub
```

**Avantages** :
- État partagé entre toutes les instances
- Persistance des lobbies (expiration 24h)
- Broadcast multi-instances via Pub/Sub

---

## 8. URLs de Production

| Service | URL |
|---------|-----|
| Frontend | `https://xxx.eu-west-1.awsapprunner.com` |
| API Proxy | `https://yyy.eu-west-1.awsapprunner.com` |
| WebSocket | `wss://speedywiki-ws-service.3ea2an7j8mje0.eu-west-1.cs.amazonlightsail.com` |

---

## 9. Leçons Apprises

### 9.1 Choix d'Infrastructure
- ❌ **App Runner** : Excellent pour HTTP/REST, **incompatible avec WebSocket**
- ✅ **Lightsail** : Support natif WebSocket, simple et prévisible
- ✅ **Redis Cloud** : Indispensable pour stateless architecture

### 9.2 Bonnes Pratiques Appliquées
- Séparation des services (Frontend / API / WebSocket)
- Externalisation complète de la configuration
- Secrets hors du code source
- Heartbeat pour connexions persistantes
- Scripts de déploiement modulaires

### 9.3 Améliorations Futures
- CI/CD automatisé (GitHub Actions)
- Monitoring et alertes (CloudWatch)
- Auto-scaling basé sur la charge
- Tests d'intégration automatisés
- Multi-région pour la résilience

---

## 10. Commandes Utiles

```powershell
# Déploiement complet
.\deploy.ps1

# Déploiement WebSocket uniquement
.\deploy-ws.ps1

# Vérification du statut
.\check-deployments.ps1

# Logs Lightsail
aws lightsail get-container-log --service-name speedywiki-ws-service --container-name speedywiki-ws-service

# Statut détaillé
aws lightsail get-container-services --service-name speedywiki-ws-service --region eu-west-1
```

