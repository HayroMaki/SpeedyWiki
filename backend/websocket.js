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

let articleList = await fetchArticles();

let plrList = [];

const websocket = new WebSocketServer({ port: 3002 });
const users = new Set();

const MONGO_URI = 'mongodb+srv://randyboujaber:CaAfkMsGpCHnoDn7@randy.x6z56.mongodb.net/';

mongoose.connect(MONGO_URI, {})
    .then(() => console.log('✅ Connecté à MongoDB Atlas'))
    .catch(err => console.error('❌ Erreur de connexion à MongoDB Atlas', err));


const cnx = mongoose.connection;
/*
let id = makeid(6);
let lobby = {
  id: id,
  link: "localhost:5173/#/Game?game="+id,
  articles: articleList,
  host: 1,
  players: plrList,
  time: 300,
  chat: []
}
*/

let i = 1;

// WEBSOCKET

websocket.on("connection", (ws) => {
  console.log("✅ Client connected");
  console.log(articleList);
  if(i === 1) {
    cnx.useDb("speedywiki").collection("Lobbys").insertOne(lobby)
  }
  if(plrList.length < 4) {
    plrList.push({
      id: i,
      name: "get_pseudo",
      picture: 3,
      color: "red",
      current_page: articleList[0].title,
      clicks: 0,
      pages: [],
      items: [],
      item_used: 0,
    });
    cnx.useDb("speedywiki").collection("Lobbys").updateOne({"id" : id}, {$set: {"players" : plrList}})
    i++
  }

  ws.on("message", (message) => {
    try {
      const { pseudo, text } = JSON.parse(message);

      if (text === 'JOIN') {
        users.add(pseudo);
      }

      // Envoi du message à tous les clients connectés
      websocket.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify({ pseudo, text }));
          lobby.chat.push({player: pseudo, text: text});

        }
      });
      cnx.useDb("speedywiki").collection("Lobbys").updateOne({"id" : id}, {$set: {"chat" : lobby.chat}})
    } catch (error) {
      console.error("Erreur de parsing JSON :", error);
    }

  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

console.log("✅ WebSocket server running on ws://localhost:3002");

