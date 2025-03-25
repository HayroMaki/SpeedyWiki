import {WebSocketServer} from "ws";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const fetchArticles = async () => {
  const numberOfArticles = 5;
  const fetchedArticles = [];
  let id = 0;

  while (fetchedArticles.length < numberOfArticles) {
    try {
      const response = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
      const data = await response.json();
      const title = data.title;

      if (!fetchedArticles.some(article => article.title === title)) {
        fetchedArticles.push({
          id: id,
          title: title,
          extract: data.extract,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          completion: false
        });
        id++;
      }
    } catch (error) {
      console.error("Error during the fetch of the articles:", error);
    }
  }
  return fetchedArticles;
}

function readEnvFile(filePath = './.env') {
    const envPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(envPath)) {
        throw new Error(`Le fichier ${filePath} n'existe pas.`);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    return envContent.split('\n').reduce((acc, line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            const value = valueParts.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
            acc[key.trim()] = value;
        }
        return acc;
    }, {});
}

// Create websocket on 3002 :
const websocket = new WebSocketServer({ port: 3002 });

// Connect to mongoDB Atlas cluster :
//const env = readEnvFile();
/*
const MONGO_URI = 'mongodb+srv://'+env["USER"]+':'+env["PASS"]+'@randy.x6z56.mongodb.net/';
mongoose.connect(MONGO_URI, {})
    .then(() => console.log('✅ Connecté à MongoDB Atlas'))
    .catch(err => console.error('❌ Erreur de connexion à MongoDB Atlas', err));
const collection = mongoose.connection.useDb("speedywiki").collection("Lobbies");
*/

const lobbies = {};

// Setup websocket :
websocket.on("connection", (ws) => {
  console.log("✅ Client connected");
  let userLobby = null;
  let userPseudo = null;
  
  ws.on("message", (message) => {
    try {
      const {type, lobby, pseudo, text} = JSON.parse(message);
      console.log(type + " on " + lobby + " - " + pseudo + " : " + text);

      // Action depending on the message type :
      switch(type) {

        case "chat":
          if (userLobby && lobbies[userLobby].players) {
            // Send the message to every user in the same lobby :
            lobbies[userLobby].players.forEach((client) => {
              if (client.ws.readyState === ws.OPEN) {
                client.ws.send(JSON.stringify({type:"chat", pseudo, text }));
              }
            });
          }
          break;

        case "create":
          /*
          collection.insertOne({"id": 1})
              .then(r => console.log("Created new game in DB."))
              .catch(err => console.error("Could not create new game in DB : ",err));
          */
          break;

        case "lobby":
          // If the lobby doesn't exist, create it and fetch random articles :
          if (!lobbies[lobby]) {
            lobbies[lobby] = {
              "players":new Set(),
              "articles": null,
            };
            fetchArticles().then((articles) => {
              lobbies[lobby].articles = articles;
              console.log(lobbies[lobby]);
            });
            console.log(lobby);
          }

          userLobby = lobby;
          userPseudo = pseudo;
          lobbies[userLobby].players.add({
            "ws":ws, 
            "pseudo":pseudo,
          });

          ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"OK"}))

          // Send the connexion message to every user in the same lobby :
          lobbies[userLobby].players.forEach((client) => {
              if (client.ws.readyState === ws.OPEN) {
                const sys_text = pseudo + " joined the game.";
                client.ws.send(JSON.stringify({type:"chat-sys", pseudo:"SYSTEM", text:sys_text}));
              }
            });
          break;
        default:
          console.log("Unknown message type : " + type + " from : " + pseudo + " : " + text );
        }
      } catch (error) {
      console.error("Erreur de parsing JSON :", error);
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    if (userLobby && lobbies[userLobby]) {

      // Send the deconnexion message to every user in the same lobby :
      lobbies[userLobby].players.forEach((client) => {
        if (client.ws.readyState === ws.OPEN) {
          const sys_text = userPseudo + " left the game.";
          client.ws.send(JSON.stringify({type: "chat-sys", pseudo:"SYSTEM", text:sys_text }));
        }
      });

      // Remove the deconnected user :
      lobbies[userLobby].players.delete(ws);

      // Delete empty lobbies :
      if (lobbies[userLobby].players.size === 0) {
        delete lobbies[userLobby];
      }
    }
  });
});

console.log("✅ WebSocket server running on ws://localhost:3002");

