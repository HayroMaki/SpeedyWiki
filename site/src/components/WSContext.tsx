import React, { createContext, useState, useContext, ReactNode } from "react";
import useRunOnce from "./tools/useRunOnce";
import Message from "../interfaces/Message";

// Définition du type pour le contexte WebSocket
interface WSContextType {
    WS: WebSocket | null;
    sendMessage: (message: Message) => void;
    messages: {
        type: any; pseudo: string; text: string 
}[];
    lobby: string;
    setLobby: React.Dispatch<React.SetStateAction<string>>;
    pseudo: string;
    setPseudo: React.Dispatch<React.SetStateAction<string>>;
}

const WSContext = createContext<WSContextType | undefined>(undefined);

export const WSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [WS, setWS] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [lobby, setLobby] = useState<string>("");
    const [pseudo, setPseudo] = useState<string>("");

    useRunOnce({
        fn: () => {
            if (!WS) {
                const socket = new WebSocket("ws://localhost:3002");

                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    setMessages((prev) => [...prev, data]);
                };

                socket.onopen = () => console.log("✅ WebSocket connecté");
                socket.onerror = (error) => console.error("❌ Erreur WebSocket :", error);
                socket.onclose = (event) => console.warn("⚠️ WebSocket fermé :", event.reason);

                setWS(socket);

                return () => {
                    socket.close();
                };
            }
        }
    });

    // Fonction pour envoyer un message
    const sendMessage = (message: Message) => {
        if (WS && WS.readyState === WebSocket.OPEN) {
            WS.send(JSON.stringify(message));
        } else {
            console.warn("⚠️ WebSocket non connecté");
        }
    };

    return (
        <WSContext.Provider value={{ WS, sendMessage, messages, lobby, setLobby, pseudo, setPseudo}}>
            {children}
        </WSContext.Provider>
    );
};

export const useWS = () => {
    const context = useContext(WSContext);
    if (!context) {
        throw new Error("useWS doit être utilisé dans un WSProvider");
    }
    return context;
};