import { WebSocketServer } from "ws";

const websocket = new WebSocketServer({ port: 3002 });
const users = new Set();

websocket.on("connection", (ws) => {
  console.log("✅ Client connected");

  ws.on("message", (message) => {
    try {
      const { pseudo, text } = JSON.parse(message);

      if (text === 'JOIN') {
        users.add(pseudo);
      }

      // Envoi du message à tous les clients connectés
      websocket.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ pseudo, text }));
        }
      });

    } catch (error) {
      console.error("Erreur de parsing JSON :", error);
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

console.log("✅ WebSocket server running on ws://localhost:3002");
