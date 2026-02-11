# Guide de Déploiement AWS (SpeedyWiki)

Ce guide explique comment déployer l'application sur AWS en utilisant **AWS App Runner**, un service entièrement géré qui facilite le déploiement d'applications conteneurisées.

## Prérequis
1.  Un compte AWS actif.
2.  [AWS CLI](https://aws.amazon.com/cli/) installé et configuré (`aws configure`).
3.  [Docker](https://www.docker.com/) installé.
4.  Un fichier `.env` à la racine du projet contenant vos secrets (voir section Configuration).

---

## Configuration (.env)

Créez un fichier `.env` à la racine du projet avec les valeurs suivantes :
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
REDIS_USERNAME=speedywiki
REDIS_PASSWORD=votre_mot_de_passe_redis
REDIS_HOST=votre_host_redis
REDIS_PORT=18676
WS_PORT=3002
```
*Note : Ce fichier est ignoré par git pour la sécurité.*

---

## Architecture de Déploiement

Nous allons déployer 3 services distincts pour assurer la scalabilité et la maintenance :
1.  **Backend API** (Proxy Wikipedia) -> **AWS App Runner**
2.  **Backend WebSocket** (Moteur de jeu) -> **AWS Lightsail Container Service** (pour le support WebSocket natif)
3.  **Frontend** (Interface React) -> **AWS App Runner**

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

## Pré-requis CLI : Rôle IAM
Pour qu'App Runner puisse télécharger vos images depuis ECR, il a besoin d'un rôle IAM.

1. Créez un fichier `trust-policy.json` :
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "build.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

2. Créez le rôle et attachez la politique :
```bash
aws iam create-role --role-name AppRunnerECRAccessRole --assume-role-policy-document file://trust-policy.json
aws iam attach-role-policy --role-name AppRunnerECRAccessRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess
```

## Étape 3 : Déployer le Backend API (CLI - PowerShell)

**Note importante :** App Runner n'est pas disponible dans la région Paris (`eu-west-3`). Nous allons déployer le service en Irlande (`eu-west-1`) tout en utilisant votre image stockée à Paris.

```powershell
aws apprunner create-service `
    --service-name speedywiki-api `
    --region eu-west-1 `
    --source-configuration 'ImageRepository={ImageIdentifier=259493838682.dkr.ecr.eu-west-3.amazonaws.com/speedywiki-backend:latest,ImageConfiguration={Port="3001",StartCommand="node server.js",RuntimeEnvironmentVariables={PORT="3001"}},ImageRepositoryType="ECR"},AuthenticationConfiguration={AccessRoleArn="arn:aws:iam::259493838682:role/AppRunnerECRAccessRole"}'
```

Une fois le service créé, récupérez son URL (en spécifiant la région) :
```powershell
aws apprunner list-services --region eu-west-1
```
Notez l'URL (`ServiceUrl`) du service `speedywiki-api`. Vous devrez peut-être mettre à jour la variable `PUBLIC_URL` plus tard :
```powershell
# Exemple de mise à jour (si nécessaire)
aws apprunner update-service --region eu-west-1 --service-arn <SERVICE_ARN> --source-configuration 'ImageRepository={...,ImageConfiguration={...,RuntimeEnvironmentVariables={PORT="3001",PUBLIC_URL="https://..."}}}'
```

## Étape 4 : Déployer le Backend WebSocket (C-I - PowerSoehlell)

**Impmo entl:cezRem`lacezO`VOTTE_MONGO_URI_COMPLET`NpGrOvotrUIchLî vtdechaîne de oMie eDB aéd loo(weelliatetmot ae)nsvwidc-canRoeIni2tommand.


## É.pprunner: Mise àackend (`
    Critique)`
 
u   --s arcn-configuration oImageReposdtory={IifiéId`nsifier=259493838682.dkr.erv.ru-west-3.ama.onaws.com/sp`epywuki-backtnd:latest,IiaglCoifi uPItion={PoCt="3002",Sta    Mettr="nour bockt.js",Ru*ti1eEnvi oumdntVariab&eh={WS_PORT="3002",MONGO_URI="VOTRE_MONGO_dRI_COMPLET"}},ImageRcprs t-ryTtwi="ECe"},Autg nticdu onC38figura62o.={Aceu-tRol-Arn="a3n:aws:ana::259493838682:rolw/ApcRunn-bECRAckassRsl"}'
cd ..
```

**2. Update Service API (Trigger Deployment) :**
Cette commande met à jour la configuration pour ajouter `PUBLIC_URL` et déclenche un nouveau déploiement avec la nouvelle image.

```powershell
aws apprunner update-service `
    --service-arn arn:aws:apprunner:eu-west-1:259493838682:service/speedywiki-api/b173d443ebf54d3db2f3c6208fa1d5ea `
    --region eu-west-1 `
    --source-configuration 'ImageRepository={ImageIdentifier=259493838682.dkr.ecr.eu-west-3.amazonaws.com/speedywiki-backend:latest,ImageConfiguration={Port="3001",StartCommand="node server.js",RuntimeEnvironmentVariables={PORT="3001",PUBLIC_URL="https://mnspmi6dtb.eu-west-1.awsapprunner.com"}},ImageRepositoryType="ECR"}'
```

---

## Étape 5 : Re-Build et Déployer le Frontend

J'ai déjà créé le fichier `site/.env.production` avec vos URLs :
*   API : `https://mnspmi6dtb.eu-west-1.awsapprunner.com`
*   WS : `wss://speedywiki-ws-service.3ea2an7j8mje0.eu-west-1.cs.amazonlightsail.com`

Il ne vous reste plus qu'à lancer ces commandes pour mettre à jour l'image et déployer le site :

### 1. Build et Push
```powershell
cd site
docker build -t speedywiki-frontend .
docker tag speedywiki-frontend:latest 259493838682.dkr.ecr.eu-west-3.amazonaws.com/speedywiki-frontend:latest
docker push 259493838682.dkr.ecr.eu-west-3.amazonaws.com/speedywiki-frontend:latest
cd ..
```

### 2. Déployer le Frontend sur App Runner
```powershell
aws apprunner create-service `
    --service-name speedywiki-site `
    --region eu-west-1 `
    --source-configuration 'ImageRepository={ImageIdentifier=259493838682.dkr.ecr.eu-west-3.amazonaws.com/speedywiki-frontend:latest,ImageConfiguration={Port="80"},ImageRepositoryType="ECR"},AuthenticationConfiguration={AccessRoleArn="arn:aws:iam::259493838682:role/AppRunnerECRAccessRole"}'
```

---

## Étape 6 : Finalisation

Une fois le service `speedywiki-site` déployé (vérifiez avec `aws apprunner list-services --region eu-west-1`), vous pourrez accéder à votre jeu via l'URL fournie !

Optionnel : Si vous avez besoin de mettre à jour l'URL du frontend dans vos backends (pour les CORS ou redirections), utilisez :
```powershell
# Remplacez SERVICE_ARN_API et SERVICE_ARN_WS par les vrais ARNs
# Et FRONTEND_URL par la nouvelle URL (https://...)
aws apprunner update-service --region eu-west-1 --service-arn SERVICE_ARN_API --source-configuration 'ImageRepository={...,ImageConfiguration={...,RuntimeEnvironmentVariables={PORT="3001",PUBLIC_URL="FRONTEND_URL"}}}'
```

## Note sur Redis (Scalabilité)
Pour l'instant, le WebSocket stocke l'état en mémoire. Si le service `speedywiki-ws` redémarre ou scale horizontalement (plus d'une instance), les joueurs seront déconnectés ou séparés.
Pour corriger cela, provisionnez un cluster **Amazon ElastiCache for Redis** et configurez le code pour l'utiliser (comme décrit dans le document de stratégie).

## Dépannage des Erreurs Courantes

### 1. API "Cannot GET /" (404) et WS "426 Upgrade Required"
C'est normal si vous visitez les liens directement. Nous avons mis à jour le code pour afficher un message "OK" à la place.
**Action :** Re-deployez le backend (voir commande ci-dessous).

### 2. Site "DNS address could not be found"
Cela signifie généralement que le service **App Runner n'a pas fini de démarrer** ou a échoué.
**Action :** Vérifiez le statut du service :
```powershell
aws apprunner list-services --region eu-west-1
```
Si le statut est `CREATE_FAILED`, regardez les logs :
1. Allez sur la console AWS -> App Runner.
2. Cliquez sur `speedywiki-site`.
3. Onglet **Logs**.

## Mise à jour Corrective (Backend).

### 2 WS "426 Upgrade Required"
Cette erreur apparaissait sur App Runner. nvec Lighesazl,ecelapnu  avrait ppus arrivqr. Siecera persiste, vérifi zlquoetius peietlztb en verc l'URL Lightkail (`.amaz"nlight:ail.com` et non App Runner

```p3wershell
cd backend
docker build -t speedywiki-backend .
docker tag speedywiki-backend:latest 259493838682.dkr.ecr.eu-west-3.amazonaws.com/speedywiki-backend:latest
docker push 259493838682.dkr.ecr.eu-west-3.amazonaws.com/speedywiki-backend:latest
cd ..
# Redéployer API et WS
aws apprunner start-deployment --service-arn arn:aws:apprunner:eu-west-1:259493838682:service/speedywiki-api/b173d443ebf54d3db2f3c6208fa1d5ea --region eu-west-1
aws apprunner start-deployment --service-arn arn:aws:apprunner:eu-west-1:259493838682:service/speedywiki-ws/eecb74b5d22746dc8928395721079508 --region eu-west-1
```

## Mise à jour Corrective (Backend)
Lancez ceci pour appliquer les correctifs de "Health Check" :

```powershell
cd backend
docker build -t speedywiki-backend .
docker tag speedywiki-backend:latest 259493838682.dkr.ecr.eu-west-3.amazonaws.com/speedywiki-backend:latest
docker push 259493838682.dkr.ecr.eu-west-3.amazonaws.com/speedywiki-backend:latest
cd ..
# Redéployer API et WS
aws apprunner start-deployment --service-arn arn:aws:apprunner:eu-west-1:259493838682:service/speedywiki-api/b173d443ebf54d3db2f3c6208fa1d5ea --region eu-west-1
aws apprunner start-deployment --service-arn arn:aws:apprunner:eu-west-1:259493838682:service/speedywiki-ws/eecb74b5d22746dc8928395721079508 --region eu-west-1
```
