import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import http from "http";

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
};

const websocket = new WebSocketServer({ port: 3002 });
const users = new Set();

const {readFile} = require("fs");

let pass = readFile("tac.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Erreur :", err);
    return;
  }
  const lignes = data.split("\n");
  return lignes[0];
});

const MONGO_URI = 'mongodb+srv://randyboujaber:'+pass+'@randy.x6z56.mongodb.net/';

mongoose.connect(MONGO_URI, {})
    .then(() => console.log('✅ Connecté à MongoDB Atlas'))
    .catch(err => console.error('❌ Erreur de connexion à MongoDB Atlas', err));


const collection = mongoose.connection.useDb("speedywiki").collection("Lobbys");
const lobbies = [];

// WEBSOCKET

websocket.on("connection", (ws) => {
  console.log("✅ Client connected");

  ws.on("message", (message) => {
    try {
      const {type, lobby, pseudo, text} = JSON.parse(message);
      console.log(type + " on " + lobby + " - " + pseudo + " : " + text);
      // Action depending on the message type :
      switch(type) {
        case ("chat"):
          // Send the message to every connected user :
          websocket.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify({type:"chat", pseudo, text }));
              //lobby.chat.push({player: pseudo, text: text});
            }
          });
          //collection.updateOne({"id" : id}, {$set: {"chat" : lobby.chat}});
          break;
        case ("create"):
          // TODO : Create a lobby and add the user to it.
          break;
        case ("lobby"):
        // Send the connexion message to every connected user :
        websocket.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
              const sys_text = pseudo + " joined the game.";
              client.send(JSON.stringify({type: "chat-sys", pseudo:"SYSTEM", text:sys_text }));
              //lobby.chat.push({player: pseudo, text: text});
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
  });
});

console.log("✅ WebSocket server running on ws://localhost:3002");

