import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWS } from "../WSContext.tsx"; // Ajustez le chemin selon votre structure

const CreateLobby: React.FC = () => {
    const { sendMessage, messages, pseudo } = useWS();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);

    // Surveiller les messages pour détecter la confirmation de création
    useEffect(() => {
        if (!isCreating) return;

        // Chercher un message de confirmation de création de lobby
        const creationMessage = messages.find(m =>
            m.type === "response-sys" &&
            m.pseudo === "SYSTEM" &&
            m.text.includes("Lobby") &&
            m.text.includes("created")
        );

        if (creationMessage) {
            setIsCreating(false);
            // Extraire l'ID du lobby
            const lobbyId = creationMessage.text.split("Lobby ")[1].split(" created")[0];
            // Naviguer vers la page de sélection
            navigate(`/Selection?game=${lobbyId}`);
        }
    }, [messages, isCreating, navigate]);

    // Timeout pour éviter que l'utilisateur attende indéfiniment
    useEffect(() => {
        if (!isCreating) return;

        const timeout = setTimeout(() => {
            if (isCreating) {
                setIsCreating(false);
                alert("La création du lobby a échoué. Veuillez réessayer.");
            }
        }, 5000); // 5 secondes de timeout

        return () => clearTimeout(timeout);
    }, [isCreating]);

    const handleCreateLobby = () => {
        setIsCreating(true);

        // Envoyer la demande de création de lobby
        sendMessage({
            type: "create",
            pseudo: pseudo || "User", // Utiliser le pseudo du contexte ou valeur par défaut
            text: "",
            lobby: "" // Champ vide car on crée un nouveau lobby
        });
    };

    return (
        <button
            onClick={handleCreateLobby}
            disabled={isCreating}
            className="home_button button" // Classes CSS directement intégrées ici
        >
            {isCreating ? "Creating..." : "Create !"}
        </button>
    );
};

export default CreateLobby;