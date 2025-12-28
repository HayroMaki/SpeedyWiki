import {WebSocketServer} from "ws";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';

import {generateUniqueId} from './functions/generateUniqueId.js';
import {fetchArticles} from './functions/fetchArticles.js';
import {readEnvFile} from './functions/readEnvFile.js';

// Create websocket on 3002 :
const websocket = new WebSocketServer({
  port: 3002,
  host: '0.0.0.0'
});

// Connect to mongoDB Atlas cluster :
const env = readEnvFile();
const MONGO_URI = 'mongodb+srv://'+env["USER"]+':'+env["PASS"]+'@jules-renaud-grange.uuold.mongodb.net/';

mongoose.connect(MONGO_URI, {})
    .then(() => console.log('✅ Connecté à MongoDB Atlas'))
    .catch(err => console.error('❌ Erreur de connexion à MongoDB Atlas', err));

const collection = mongoose.connection.useDb("speedywiki").collection("Lobbies");

const lobbies = {};

// Setup websocket :
websocket.on("connection", (ws) => {
  console.log("✅ Client connected");
  let userLobby = null;
  let userPseudo = null;
  let userObj = null;
  
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
          // Create a lobby and send the lobbyId back.
          const lobbyId = generateUniqueId(6,new Set(Object.keys(lobbies)));
          lobbies[lobbyId] = {
            "id": lobbyId,
            "players": new Set(),
            "articles": null,
            "Startarticle": null,
            "mined-articles": null,
            "winners":null
          }
          fetchArticles().then((articles) => {
            // Vérifier qu'il y a au moins un article
            if (articles.length > 0) {
              // Startarticle est une liste avec null puis le premier article
              lobbies[lobbyId].Startarticle = [null, articles[0]];

              // Le reste des articles (sans le premier) va dans articles
              lobbies[lobbyId].articles = articles.slice(1);
            } else {
              // Gérer le cas où il n'y a pas d'articles
              lobbies[lobbyId].Startarticle = [null, null]; // ou [null] si vous préférez
              lobbies[lobbyId].articles = [];
            }
            
            console.log("Articles fetched for lobby " + lobbyId + 'Articles :' + lobbies[lobbyId].articles.length);
          });
          lobbies[lobbyId].winners = [];
          console.log("Lobby created : ID : ",lobbyId);

          // Réponse plus claire avec l'ID du lobby
          ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"Lobby " + lobbyId + " created."}));

          collection.insertOne(lobbies[lobbyId]).then(r => {
            console.log("Lobby created in DB : DB_ID : ", r.insertedId);
          })
              .catch(error => {
                console.error("Error while inserting lobby : ", error);
              });
          break;

        case "lobby":
          switch (text) {
            case "JOIN":
              // Check that the lobby exists :
              if (lobbies[lobby]) {
                const { type, lobby, pseudo, text, image } = JSON.parse(message);
                userLobby = lobby;
                userPseudo = pseudo;
                userObj = {
                  "ws":ws,
                  "pseudo":pseudo,
                  "image": typeof image !== "undefined" ? image : 2 // ← fallback à 0 si image non fournie
                };


                // Add the player to the lobby and notify him that he can join (OK) :
                lobbies[userLobby].players.add(userObj);

                ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"OK"}));

                const playersArray = Array.from(lobbies[userLobby].players).map(player => ({
                  pseudo: player.pseudo,
                  image: player.image
                }));

                lobbies[lobby].players.forEach((client) => {
                  if (client.ws.readyState === client.ws.OPEN) {
                    client.ws.send(JSON.stringify({
                      type: "PLAYERS",
                      pseudo: "SYSTEM",
                      text: playersArray 
                    }));
                  }
                });
                
                // Send the connexion message to every user in the same lobby :
                lobbies[userLobby].players.forEach((client) => {
                  if (client.ws.readyState === ws.OPEN) {
                    const sys_text = pseudo + " joined the game.";
                    client.ws.send(JSON.stringify({type:"chat-sys", pseudo:"SYSTEM", text:sys_text}));
                  }
                });
                var plrList = {$set: { players: playersArray }};
                collection.updateOne({id : lobby}, plrList).then(r => {
                  console.log("Player list updated in lobby : ", lobby);
                })
                    .catch(error => {
                      console.error("Error when updating player list in lobby : ", error);
                    });
              } else {
                // If lobby does not exist, notify him that he cannot join (KO) :
                ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"KO"}));
              }

              break;
            case "CHECK":
              // Return whether the lobby exists or not :
              if (lobbies[lobby]) {
                ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"OK"}));
              } else {
                ws.send(JSON.stringify({type:"response-sys", pseudo:"SYSTEM", text:"KO"}));
              }
              break;
            case "QUIT":
              if (lobbies[lobby]) {
                const { type, lobby, pseudo, text, image } = JSON.parse(message);
                userLobby = lobby;
                userPseudo = pseudo;
                userObj = {
                  "ws":ws,
                  "pseudo":pseudo,
                  "image": typeof image !== "undefined" ? image : 2 // ← fallback à 0 si image non fournie
                };
                for (const player of lobbies[userLobby].players) {
                  if (player.pseudo === pseudo) {
                    lobbies[userLobby].players.delete(player);
                    break;
                  }
                }
                const playersArray = Array.from(lobbies[userLobby].players).map(player => ({
                  pseudo: player.pseudo,
                  image: player.image
              }));
              lobbies[lobby].players.forEach((client) => {
                if (client.ws.readyState === client.ws.OPEN) {
                  client.ws.send(JSON.stringify({
                    type: "PLAYERS",
                    pseudo: "SYSTEM",
                    text: playersArray 
                  }));
                }
              });
                lobbies[userLobby].players.forEach((client) => {
                  if (client.ws.readyState === ws.OPEN) {
                    const sys_text = pseudo + " quit the game.";
                    client.ws.send(JSON.stringify({type:"chat-sys", pseudo:"SYSTEM", text:sys_text}));
                  }
                });
                var plrLeave = {$set: { players: playersArray }};
                collection.updateOne({id : lobby}, plrLeave).then(r => {
                  console.log("Player list updated in lobby : ", lobby);
                })
                    .catch(error => {
                      console.error("Error when updating player list in lobby : ", error);
                    });
              }
                break;
            case "START":
                if (lobbies[lobby]) {
                  
                    // Envoyer un message à tous les joueurs du lobby
                    lobbies[lobby].players.forEach((client) => {
                        if (client.ws.readyState === client.ws.OPEN) {
                            client.ws.send(JSON.stringify({
                                type: "START",
                                pseudo: "SYSTEM",
                                lobby: lobby,
                                text: lobbies[lobby].articles
                            }));
                        }
                    });
                    
                    lobbies[lobby].players.forEach((client) => {
                      if (client.ws.readyState === client.ws.OPEN) {
                          client.ws.send(JSON.stringify({
                              type: "STARTPAGE",
                              pseudo: "SYSTEM",
                              lobby: lobby,
                              text: lobbies[lobby].Startarticle
                          }));
                      }
                  });
                  var artList = {$set: { articles: lobbies[lobby].articles }};
                  collection.updateOne({id : lobby}, artList).then(r => {
                    console.log("Article list updated in lobby : ", lobby);
                  })
                      .catch(error => {
                        console.error("Error when updating article list in lobby : ", error);
                      });

                }

                
                break;
          }
          break;
        case "win":
          console.log("Win websocket");
          if (lobbies[lobby]) {
          if (!lobbies[lobby] || !Array.isArray(lobbies[lobby].winners)) {
            console.error("Lobby or winners list is invalid");
            return;
          }
          
          
          const winnerSet = new Set(lobbies[lobby].winners.map(w => w.pseudo));
          
          if (!winnerSet.has(pseudo)) {
            lobbies[lobby].winners.push({
              pseudo: pseudo,
              image: userObj?.image ?? 0,
              clicks: text
            });
          }
          
          lobbies[lobby].winners.sort((a, b) => parseInt(a.clicks) - parseInt(b.clicks));
            lobbies[lobby].players.forEach((client) => {
              if (client.ws.readyState === client.ws.OPEN) {
                  client.ws.send(JSON.stringify({
                      type: "WIN",
                      pseudo: "SYSTEM",
                      lobby: lobby,
                      text: lobbies[lobby].winners
                  }));
              }
          });
        }
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

      // Remove the deconnected user :
      lobbies[userLobby].players.delete(userObj);
      console.log("Removed player %s from lobby %d.",userObj.pseudo, userLobby);

      // Send the deconnexion message to every user in the same lobby :
      lobbies[userLobby].players.forEach((client) => {
        if (client.ws.readyState === ws.OPEN) {
          const sys_text = userPseudo + " left the game.";
          client.ws.send(JSON.stringify({type: "chat-sys", pseudo:"SYSTEM", text:sys_text }));
        }
      });

      // Delete empty lobbies :
      if (lobbies[userLobby].players.size === 0) {
        console.log("No more players in lobby %d -> deleting.",userLobby);
        delete lobbies[userLobby];
      }
    }
  });
});

console.log("✅ WebSocket server running on ws://localhost:3002");

