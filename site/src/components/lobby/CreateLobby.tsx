import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWS } from "../WSContext.tsx";

const CreateLobby: React.FC = () => {
    const { sendMessage, setMessages, clear, messages, pseudo, getResponse } = useWS();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);

    // Check for the creation response :
    useEffect(() => {
        if (!isCreating) return;

        const m = getResponse();
        console.log(m);
        if (m && m.text.includes("Lobby") && m.text.includes("created")) {
            setIsCreating(false);
            // Extract the created lobby's id :
            const lobbyId = m.text.split("Lobby ")[1].split(" created")[0];
            clear("response-sys","SYSTEM");
            // Move directly to selection page with the lobby id in GET :
            navigate(`/Selection?game=${lobbyId}`);
        }
    }, [messages, isCreating, navigate]);

    // Timeout to prevent infinite waiting for the user :
    useEffect(() => {
        if (!isCreating) return;

        const timeout = setTimeout(() => {
            if (isCreating) {
                setIsCreating(false);
                alert("Lobby creation failed...");
            }
        }, 5000);

        return () => clearTimeout(timeout);
    }, [isCreating]);

    const handleCreateLobby = () => {
        setIsCreating(true);
        setMessages([]);

        // Send the creation lobby message :
        sendMessage({
            type: "create",
            pseudo: pseudo || "User",
            text: "",
            lobby: ""
        });
    };

    return (
        <button
            onClick={handleCreateLobby}
            disabled={isCreating}
            className="home_button button"
        >
            {isCreating ? "Creating..." : "Create !"}
        </button>
    );
};

export default CreateLobby;