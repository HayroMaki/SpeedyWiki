import {WebSocketServer} from "ws";
import mongoose from "mongoose";
import { createServer } from 'http';
import { createClient } from 'redis';

import {generateUniqueId} from './functions/generateUniqueId.js';
import {fetchArticles} from './functions/fetchArticles.js';
import {readEnvFile} from './functions/readEnvFile.js';

const env = readEnvFile();

// --- Redis Setup ---
const redisConfig = {
  username: env.REDIS_USERNAME || 'speedywiki',
  password: env.REDIS_PASSWORD,
  socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT || 18676
  }
};

// Client for data operations
const redisClient = createClient(redisConfig);
// Client for publishing messages
const pubClient = createClient(redisConfig);
// Client for subscribing to messages
const subClient = createClient(redisConfig);

redisClient.on('error', (err) => console.error('Redis Client Error', err));
pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
subClient.on('error', (err) => console.error('Redis Sub Client Error', err));

Promise.all([redisClient.connect(), pubClient.connect(), subClient.connect()])
  .then(() => {
    console.log('✅ Connected to Redis (Data, Pub, Sub)');
    
    // Subscribe to global channel
    subClient.subscribe('speedywiki:events', (message) => {
      try {
        const { lobbyId, payload } = JSON.parse(message);
        broadcastToLocalLobby(lobbyId, payload);
      } catch (e) {
        console.error("Error handling redis message:", e);
      }
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to Redis:', err);
    process.exit(1);
  });

// --- Local Connections Management ---
// We only store the *active connections* for this specific instance here.
// Shared state is in Redis.
const localConnections = new Map(); // lobbyId -> Set<UserObj>

function addLocalConnection(lobbyId, userObj) {
  if (!localConnections.has(lobbyId)) {
    localConnections.set(lobbyId, new Set());
  }
  localConnections.get(lobbyId).add(userObj);
}

function removeLocalConnection(lobbyId, userObj) {
  if (localConnections.has(lobbyId)) {
    const set = localConnections.get(lobbyId);
    set.delete(userObj);
    if (set.size === 0) {
      localConnections.delete(lobbyId);
    }
  }
}

function broadcastToLocalLobby(lobbyId, messageString) {
  const clients = localConnections.get(lobbyId);
  if (clients) {
    clients.forEach(client => {
      if (client.ws.readyState === client.ws.OPEN) {
        client.ws.send(messageString);
      }
    });
  }
}

// Publish a message to be received by ALL instances (including self) and sent to clients
async function publishToLobby(lobbyId, messageObj) {
  const payload = JSON.stringify(messageObj);
  // We wrap it to target the lobby
  await pubClient.publish('speedywiki:events', JSON.stringify({
    lobbyId,
    payload
  }));
}


// Create HTTP server for Health Checks & WebSocket upgrade
const PORT = process.env.WS_PORT || 3002;
const server = createServer((req, res) => {
  // console.log(`[HTTP] Request: ${req.method} ${req.url}`);
  
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SpeedyWiki WebSocket is running');
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Create websocket attached to the HTTP server
const websocket = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  // console.log(`[UPGRADE] Request: ${request.method} ${request.url}`);
  websocket.handleUpgrade(request, socket, head, (ws) => {
    websocket.emit('connection', ws, request);
  });
});

// Connect to mongoDB Atlas cluster :
const MONGO_URI = env.MONGO_URI || process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {})
    .then(() => console.log('✅ Connecté à MongoDB Atlas'))
    .catch(err => console.error('❌ Erreur de connexion à MongoDB Atlas', err));

const collection = mongoose.connection.useDb("speedywiki").collection("Lobbies");

// Helper to construct Redis keys
const kLobby = (id) => `lobby:${id}`;
const kPlayers = (id) => `lobby:${id}:players`;

// Setup websocket :
websocket.on("connection", (ws) => {
  console.log("✅ Client connected");
  let userLobby = null;
  let userPseudo = null;
  let userObj = null;
  
  ws.on("message", async (message) => {
    try {
      const {type, lobby, pseudo, text} = JSON.parse(message);
      
      console.log(type + " on " + lobby + " - " + pseudo + " : " + text);

      // Action depending on the message type :
      switch(type) {

        case "chat":
          if (userLobby) {
             await publishToLobby(userLobby, {type: "chat", pseudo, text});
          }
          break;

        case "create":
          // Create a lobby and send the lobbyId back.
          // We need to generate a unique ID. We can't check `lobbies` object anymore.
          // We'll trust generateUniqueId for now or check redis.
          // Ideally we should check existence in Redis.
          let lobbyId = generateUniqueId(6, new Set()); // Passing empty set, collisions unlikely but possible.
          let attempts = 0;
          while (await redisClient.exists(kLobby(lobbyId)) && attempts < 5) {
             lobbyId = generateUniqueId(6, new Set());
             attempts++;
          }

          // Initial State
          const initialState = {
            id: lobbyId,
            isReady: "false",
            articles: "[]",
            Startarticle: "[]",
            winners: "[]"
          };
          
          await redisClient.hSet(kLobby(lobbyId), initialState);
          // Set expiry (e.g. 24 hours) to prevent garbage accumulation
          await redisClient.expire(kLobby(lobbyId), 86400);

          fetchArticles()
            .then(async (articles) => {
                let startArticle = [null, null];
                let gameArticles = [];

                if (articles.length > 0) {
                    startArticle = [null, articles[0]];
                    gameArticles = articles.slice(1);
                }

                console.log("Articles fetched for lobby " + lobbyId + ' Articles :' + gameArticles.length);
                
                // Update Redis
                await redisClient.hSet(kLobby(lobbyId), {
                    isReady: "true",
                    articles: JSON.stringify(gameArticles),
                    Startarticle: JSON.stringify(startArticle)
                });

                // Notify Players
                await publishToLobby(lobbyId, {
                    type: "READY", 
                    pseudo: "SYSTEM", 
                    lobby: lobbyId, 
                    text: "ARTICLES_READY"
                });
            })
            .catch(async (error) => {
              console.error("Error fetching articles for lobby", lobbyId, error);
              
              await publishToLobby(lobbyId, {
                  type: "READY", 
                  pseudo: "SYSTEM", 
                  lobby: lobbyId, 
                  text: "ARTICLES_ERROR"
              });
            });

          console.log("Lobby created : ID : ", lobbyId);

          // Reply specifically to the creator (ws)
          ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"Lobby " + lobbyId + " created."}));

          // DB logging (optional/async)
          collection.insertOne({id: lobbyId, createdAt: new Date()}).catch(e => console.error("DB Insert Error", e));
          break;

        case "lobby":
          switch (text) {
            case "JOIN":
              // Check if lobby exists in Redis
              const exists = await redisClient.exists(kLobby(lobby));
              if (exists) {
                const { type, lobby, pseudo, text, image } = JSON.parse(message);
                userLobby = lobby;
                userPseudo = pseudo;
                userObj = {
                  "ws": ws,
                  "pseudo": pseudo,
                  "image": typeof image !== "undefined" ? image : 2
                };

                // Add to local connections
                addLocalConnection(userLobby, userObj);

                // Add to Redis Player Set (Stored as JSON string to keep metadata)
                const playerJson = JSON.stringify({ pseudo: pseudo, image: userObj.image });
                await redisClient.sAdd(kPlayers(userLobby), playerJson);
                await redisClient.expire(kPlayers(userLobby), 86400);

                // Send OK to user
                ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"OK"}));

                // Get all players from Redis to broadcast list
                const members = await redisClient.sMembers(kPlayers(userLobby));
                const playersArray = members.map(m => JSON.parse(m));

                await publishToLobby(userLobby, {
                    type: "PLAYERS",
                    pseudo: "SYSTEM",
                    text: playersArray
                });
                
                // Chat notification
                const sys_text = pseudo + " joined the game.";
                await publishToLobby(userLobby, {type:"chat-sys", pseudo:"SYSTEM", text:sys_text});

                // Update DB
                collection.updateOne({id : lobby}, {$set: { players: playersArray }}).catch(e => {});

              } else {
                ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"KO"}));
              }
              break;

            case "CHECK":
              if (await redisClient.exists(kLobby(lobby))) {
                ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"OK"}));
              } else {
                ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"KO"}));
              }
              break;

            case "QUIT":
              if (await redisClient.exists(kLobby(lobby))) {
                const { type, lobby, pseudo, text, image } = JSON.parse(message);
                userLobby = lobby;
                userPseudo = pseudo;
                userObj = {
                  "ws": ws,
                  "pseudo": pseudo,
                  "image": typeof image !== "undefined" ? image : 2
                };

                // Remove from Redis
                const playerJson = JSON.stringify({ pseudo: pseudo, image: userObj.image });
                await redisClient.sRem(kPlayers(userLobby), playerJson);
                
                // Remove from local (will be handled by close, but good to be explicit if action is sent)
                removeLocalConnection(userLobby, userObj);

                // Broadcast new list
                const members = await redisClient.sMembers(kPlayers(userLobby));
                const playersArray = members.map(m => JSON.parse(m));

                await publishToLobby(userLobby, {
                    type: "PLAYERS",
                    pseudo: "SYSTEM",
                    text: playersArray
                });

                const sys_text = pseudo + " quit the game.";
                await publishToLobby(userLobby, {type:"chat-sys", pseudo:"SYSTEM", text:sys_text});
                
                collection.updateOne({id : lobby}, {$set: { players: playersArray }}).catch(e => {});
              }
              break;

            case "START":
                if (await redisClient.exists(kLobby(lobby))) {
                  const isReady = await redisClient.hGet(kLobby(lobby), 'isReady');
                  
                  if (isReady !== "true") {
                    ws.send(JSON.stringify({
                      type: "response-sys",
                      pseudo: "SYSTEM",
                      text: "Lobby not ready yet. Please wait for articles to load."
                    }));
                    await publishToLobby(lobby, {
                      type: "chat-sys",
                      pseudo: "SYSTEM",
                      text: "Cannot start the game. Articles are loading, try again in a second."
                    });
                    break;
                  }
                  
                  const articlesStr = await redisClient.hGet(kLobby(lobby), 'articles');
                  const startArticleStr = await redisClient.hGet(kLobby(lobby), 'Startarticle');
                  
                  const articles = JSON.parse(articlesStr || "[]");
                  const startArticle = JSON.parse(startArticleStr || "[]");

                  // START Message
                  await publishToLobby(lobby, {
                      type: "START",
                      pseudo: "SYSTEM",
                      lobby: lobby,
                      text: articles
                  });
                    
                  // STARTPAGE Message
                  await publishToLobby(lobby, {
                      type: "STARTPAGE",
                      pseudo: "SYSTEM",
                      lobby: lobby,
                      text: startArticle
                  });

                  collection.updateOne({id : lobby}, {$set: { articles: articles }}).catch(e => {});
                }
                break;
          }
          break;

        case "win":
          console.log("Win websocket");
          if (await redisClient.exists(kLobby(lobby))) {
            const winnersStr = await redisClient.hGet(kLobby(lobby), 'winners');
            let winners = JSON.parse(winnersStr || "[]");
            
            // Check if already won
            const winnerSet = new Set(winners.map(w => w.pseudo));
            
            if (!winnerSet.has(pseudo)) {
                const newWinner = {
                    pseudo: pseudo,
                    image: userObj?.image ?? 0,
                    clicks: text
                };
                winners.push(newWinner);
                
                // Sort
                winners.sort((a, b) => parseInt(a.clicks) - parseInt(b.clicks));
                
                // Save back to Redis
                await redisClient.hSet(kLobby(lobby), 'winners', JSON.stringify(winners));

                // Broadcast
                await publishToLobby(lobby, {
                    type: "WIN",
                    pseudo: "SYSTEM",
                    lobby: lobby,
                    text: winners
                });
            }
          }
        break;

        default:
          console.log("Unknown message type : " + type + " from : " + pseudo + " : " + text );
      }
    } catch (error) {
      console.error("Erreur de parsing JSON/Processing :", error);
    }
  });

  ws.on("close", async () => {
    console.log("❌ Client disconnected");
    if (userLobby && userObj) {
        
      // Remove from Local
      removeLocalConnection(userLobby, userObj);
      
      // Remove from Redis
      // Note: We need the exact string to remove from Set. 
      // This assumes pseudo/image didn't change.
      const playerJson = JSON.stringify({ pseudo: userPseudo, image: userObj.image });
      await redisClient.sRem(kPlayers(userLobby), playerJson);
      
      console.log("Removed player %s from lobby %d.", userPseudo, userLobby);

      // Notification
      const sys_text = userPseudo + " left the game.";
      await publishToLobby(userLobby, {type: "chat-sys", pseudo:"SYSTEM", text:sys_text });
      
      // Check if lobby is empty (global check)
      const count = await redisClient.sCard(kPlayers(userLobby));
      if (count === 0) {
        console.log("No more players in lobby %s -> deleting data.", userLobby);
        await redisClient.del(kLobby(userLobby));
        await redisClient.del(kPlayers(userLobby));
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ WebSocket Server running on port ${PORT}`);
});
