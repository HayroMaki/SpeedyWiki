# SpeedyWiki 🏃‍♂️📖

A multiplayer Wikipedia racing game where players compete to navigate from one article to another using only Wikipedia links.

## 🎮 How It Works

Players join lobbies and race to reach a target Wikipedia article starting from a common article. The fastest player to find the path wins! The game uses real Wikipedia content through a proxy system.

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend API**: Node.js + Express (Wikipedia proxy)
- **Backend WebSocket**: Node.js + ws (game engine)
- **Database**: MongoDB Atlas
- **State Store**: Redis Cloud (for scalability)

### Cloud Infrastructure (AWS)
- **Frontend & API**: AWS App Runner (eu-west-1)
- **WebSocket**: AWS Lightsail Container Service (eu-west-1)
- **Container Registry**: AWS ECR (eu-west-3)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- npm
- MongoDB Atlas account
- Redis Cloud account (optional for local dev)

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../site
npm install
```

### 2. Configure Environment Variables

#### Root `.env` (for deployment)
Create `.env` at the project root:
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/
REDIS_USERNAME=your_redis_username
REDIS_PASSWORD=your_redis_password
REDIS_HOST=your_redis_host
REDIS_PORT=18676
WS_PORT=3002
```

#### Backend `.env` (for local dev)
Create `backend/.env`:
```env
PORT=3001
PUBLIC_URL=http://localhost:3001
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/
REDIS_USERNAME=your_redis_username
REDIS_PASSWORD=your_redis_password
REDIS_HOST=your_redis_host
REDIS_PORT=18676
WS_PORT=3002
```

#### Frontend `.env.production` (for production build)
Already configured in `site/.env.production` with production URLs.

### 3. Run the Application

```bash
# Terminal 1 - Backend API (port 3001)
cd backend
node server.js

# Terminal 2 - WebSocket Server (port 3002)
cd backend
node websocket.js

# Terminal 3 - Frontend Dev Server (port 4173)
cd site
npm run dev
```

Access the game at `http://localhost:4173`

---

## ☁️ Cloud Deployment

### Prerequisites
- AWS CLI configured (`aws configure`)
- Docker installed
- Root `.env` file with production credentials

### Deploy All Services

```powershell
# Full deployment (Frontend + API + WebSocket)
.\deploy.ps1
```

### Deploy Individual Services

```powershell
# Frontend only
.\deploy-site.ps1

# API only
.\deploy-api.ps1

# WebSocket only
.\deploy-ws.ps1
```

### Check Deployment Status

```powershell
.\check-deployments.ps1
```

**Detailed deployment guide**: See [`DEPLOY_AWS.md`](./DEPLOY_AWS.md)

---

## 📚 Documentation

- **[DEPLOY_AWS.md](./DEPLOY_AWS.md)**: Complete AWS deployment guide (ECR, App Runner, Lightsail)
- **[MOVE_TO_CLOUD.md](./MOVE_TO_CLOUD.md)**: Migration post-mortem (problems, solutions, architecture)

---

## 🔧 Project Structure

```
SpeedyWiki/
├── backend/
│   ├── server.js           # Express API (Wikipedia proxy)
│   ├── websocket.js        # WebSocket game engine
│   ├── functions/          # Utility functions
│   └── Dockerfile          # Backend container image
├── site/
│   ├── src/                # React frontend source
│   ├── .env.production     # Production environment variables
│   └── Dockerfile          # Frontend container image
├── deploy.ps1              # Global deployment script
├── deploy-site.ps1         # Frontend deployment
├── deploy-api.ps1          # API deployment
├── deploy-ws.ps1           # WebSocket deployment (Lightsail)
├── check-deployments.ps1   # Status checker
├── .env                    # Root secrets (gitignored)
└── .gitignore
```

---

## 🎯 Key Features

- **Real-time multiplayer**: WebSocket-based game synchronization
- **Scalable architecture**: Redis for distributed state management
- **Cloud-native**: Fully containerized and deployed on AWS
- **Secure**: Environment-based configuration, no hardcoded secrets
- **Resilient**: Heartbeat mechanism prevents connection drops

---

## 🛠️ Troubleshooting

### WebSocket Connection Issues
- Ensure `VITE_WS_URL` in `site/.env.production` points to the correct Lightsail URL
- Check Lightsail deployment status: `aws lightsail get-container-services --service-name speedywiki-ws-service`

### MongoDB Connection Errors
- Verify `MONGO_URI` in `.env` is correct
- Check MongoDB Atlas network access (whitelist IP `0.0.0.0/0` for cloud deployments)

### Redis Connection Errors
- Verify Redis credentials in `.env`
- Test connection: Create a test script with the Redis client

### Deployment Failures
- Check Docker daemon is running
- Verify AWS credentials: `aws sts get-caller-identity`
- Review CloudWatch logs for App Runner services

---

## 📝 License

This project is for educational purposes.
