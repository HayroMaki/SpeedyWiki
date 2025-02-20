import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

const WS_URL = "ws://localhost:8080"; // Adresse du serveur WebSocket

// 🏷️ Définition des types des messages WebSocket
type RoleMessage = { role: "host" | "player" };
type UpdateMessage = { type: "update"; payload: { message: string } };
type WebSocketMessage = RoleMessage | UpdateMessage;

function GamePage() {
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<WebSocketMessage>(WS_URL, {
    shouldReconnect: () => true, // Reconnexion automatique
  });

  const [role, setRole] = useState<"host" | "player" | null>(null);
  const [gameState, setGameState] = useState<{ message: string } | null>(null);

  // 🔄 Gestion des messages WebSocket
  useEffect(() => {
    if (!lastJsonMessage) return;

    // Vérifie si le message contient un rôle
    if ("role" in lastJsonMessage) {
      setRole(lastJsonMessage.role);
    }

    // Vérifie si le message est une mise à jour
    if ("type" in lastJsonMessage && lastJsonMessage.type === "update") {
      setGameState(lastJsonMessage.payload);
    }
  }, [lastJsonMessage]);

  // 📤 L'hôte envoie une mise à jour aux joueurs
  const updateGame = () => {
    if (role === "host") {
      sendJsonMessage({ type: "update", payload: { message: "Nouvelle info pour le joueur" } });
    }
  };

  return (
    <div>
      <h1>Vous êtes : {role ?? "en attente..."}</h1>
      {role === "host" ? (
        <button onClick={updateGame}>Envoyer une mise à jour</button>
      ) : (
        <p>Message reçu : {gameState?.message ?? "Aucune mise à jour pour l’instant"}</p>
      )}
    </div>
  );
}

export default GamePage;