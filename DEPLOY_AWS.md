# Guide de Déploiement AWS (SpeedyWiki)

Ce guide explique comment déployer l'application sur AWS en utilisant **AWS App Runner**, un service entièrement géré qui facilite le déploiement d'applications conteneurisées.

## Prérequis
1.  Un compte AWS actif.
2.  [AWS CLI](https://aws.amazon.com/cli/) installé et configuré (`aws configure`).
3.  [Docker](https://www.docker.com/) installé.

---

## Architecture de Déploiement

Nous allons déployer 3 services distincts pour assurer la scalabilité et la maintenance :
1.  **Backend API** (Proxy Wikipedia)
2.  **Backend WebSocket** (Moteur de jeu)
3.  **Frontend** (Interface React)

Tous utiliseront **AWS App Runner**.

---

## Étape 1 : Créer les référentiels d'images (ECR)

Nous devons stocker nos images Docker sur AWS ECR (Elastic Container Registry).

1.  Connectez-vous à la console AWS -> **Elastic Container Registry**.
2.  Créez deux référentiels "Privés" :
    *   `speedywiki-backend`
    *   `speedywiki-frontend`

Ou via CLI :
```bash
aws ecr create-repository --repository-name speedywiki-backend
aws ecr create-repository --repository-name speedywiki-frontend
```

---

## Étape 2 : Build et Push des images

Assurez-vous d'être connecté à ECR via Docker (remplacez `ACCOUNT_ID` et `REGION` par vos infos) :
```bash
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
```

### 2.1 Backend
Nous utilisons la même image pour l'API et le WebSocket.

```bash
cd backend
docker build -t speedywiki-backend .
docker tag speedywiki-backend:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/speedywiki-backend:latest
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/speedywiki-backend:latest
```

### 2.2 Frontend (Build Initial)
*Note : Le frontend a besoin des URLs du backend pour être construit correctement. Nous ferons un premier push, mais nous devrons le refaire une fois les services backend déployés.*

```bash
cd site
docker build -t speedywiki-frontend .
docker tag speedywiki-frontend:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/speedywiki-frontend:latest
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/speedywiki-frontend:latest
```

---

## Étape 3 : Déployer le Backend API

1.  Allez dans **AWS App Runner** -> **Create Service**.
2.  **Source** : Container Registry (ECR). Sélectionnez l'image `speedywiki-backend:latest`.
3.  **Deployment settings** : Automatic (déploie à chaque push).
4.  **Service configuration** :
    *   **Service name** : `speedywiki-api`
    *   **Port** : `3001`
    *   **Start command** : `node server.js`
    *   **Environment variables** :
        *   `PORT` = `3001`
        *   `PUBLIC_URL` = Laisser vide pour l'instant (App Runner fournira une URL HTTPS).
5.  Créez le service.
6.  Une fois déployé, notez l'**URL par défaut** (ex: `https://api.awsapprunner.com`). Ajoutez la variable d'environnement `PUBLIC_URL` = `https://api.awsapprunner.com` et redéployez si nécessaire.

---

## Étape 4 : Déployer le Backend WebSocket

1.  **Create Service** sur App Runner.
2.  **Source** : Même image `speedywiki-backend:latest`.
3.  **Service configuration** :
    *   **Service name** : `speedywiki-ws`
    *   **Port** : `3002`
    *   **Start command** : `node websocket.js`
    *   **Environment variables** :
        *   `WS_PORT` = `3002`
        *   `MONGO_URI` = `mongodb+srv://...` (Votre chaîne de connexion complète)
        *   `FRONTEND_URL` = Laisser vide pour l'instant.

---

## Étape 5 : Re-Build et Déployer le Frontend

Maintenant que nous avons les URLs de l'API et du WebSocket, nous devons reconstruire le frontend.

1.  Récupérez les URLs des services créés :
    *   API URL : ex `https://xyz.awsapprunner.com`
    *   WS URL : ex `wss://abc.awsapprunner.com` (Notez `wss://` au lieu de `https://`)

2.  Re-buildez l'image frontend avec ces arguments (ou modifiez `.env` localement avant build) :

*Méthode recommandée : créer un fichier `.env.production` localement dans `site/`*
```env
VITE_API_URL=https://votre-url-api.awsapprunner.com
VITE_WS_URL=wss://votre-url-ws.awsapprunner.com
```

3.  Build et Push :
```bash
cd site
docker build -t speedywiki-frontend .
docker tag speedywiki-frontend:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/speedywiki-frontend:latest
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/speedywiki-frontend:latest
```

4.  **Create Service** sur App Runner pour le Frontend :
    *   **Source** : Image `speedywiki-frontend:latest`.
    *   **Port** : `80`
    *   **Service name** : `speedywiki-site`

---

## Étape 6 : Finalisation

1.  Récupérez l'URL finale du Frontend App Runner.
2.  Mettez à jour les variables d'environnement des services Backends :
    *   Sur `speedywiki-api` : `FRONTEND_URL` = `https://votre-url-frontend.awsapprunner.com`
    *   Sur `speedywiki-ws` : `FRONTEND_URL` = `https://votre-url-frontend.awsapprunner.com` (si utilisé).

Votre application est maintenant en ligne ! 🚀

## Note sur Redis (Scalabilité)
Pour l'instant, le WebSocket stocke l'état en mémoire. Si le service `speedywiki-ws` redémarre ou scale horizontalement (plus d'une instance), les joueurs seront déconnectés ou séparés.
Pour corriger cela, provisionnez un cluster **Amazon ElastiCache for Redis** et configurez le code pour l'utiliser (comme décrit dans le document de stratégie).
