import React, { createContext, useState, useContext, ReactNode } from "react";
import useRunOnce from "./tools/useRunOnce";
import Message from "../interfaces/Message";
import User from "../interfaces/User";

// Définition du type pour le contexte WebSocket
interface WSContextType {
    WS: WebSocket | null;
    sendMessage: (message: Message) => void;
    messages: {
        type: any; pseudo: string; text: string 
    }[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    getResponse: () => Message | null;
    getPlayers: () => Message | null;
    getStart: () => Message | null;
    getStartingPage:() => Message | null;
    clear: (type:string, pseudo:string) => void;
    lobby: string;
    setLobby: React.Dispatch<React.SetStateAction<string>>;
    pseudo: string;
    setPseudo: React.Dispatch<React.SetStateAction<string>>;
    picture: number;
    setPicture: React.Dispatch<React.SetStateAction<number>>;
    player : User | null;
    setPlayer: React.Dispatch<React.SetStateAction<User | null>>;
}

const WSContext = createContext<WSContextType | undefined>(undefined);

export const WSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [WS, setWS] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [lobby, setLobby] = useState<string>("");
    const [pseudo, setPseudo] = useState<string>("");
    const [picture,setPicture] = useState<number>(0);
    const [player, setPlayer] = useState<User | null>(null);


    useRunOnce({
        fn: () => {
            if (!WS) {
                const host = window.location.hostname;
                const socket = new WebSocket("ws://"+host+":3002");

                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    console.log("received :",data);
                    setMessages((prev) => {
                        const newMsg = [...prev, data];
                        return newMsg;
                    });
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

    const getResponse = () => {
        for (const m of messages) {
            if (m.type == "response-sys" && m.pseudo == "SYSTEM") {
                return m;
            }
        }
        return null;
    }

    const getPlayers = () => {
        for (const m of messages) {
            if (m.type == "PLAYERS" && m.pseudo == "SYSTEM") {
                return m;
            }
        }
        return null;
    }

    const getStart = () => {
        for (const m of messages) {
            if (m.type == "START" && m.pseudo == "SYSTEM") {
                return m;
            }
        }
        return null;
    }

    const getStartingPage = () => {
        for (const m of messages) {
            if (m.type == "STARTPAGE" && m.pseudo == "SYSTEM") {
                console.log(m)
                return m;
            }
        }
        return null;
    }

    const clear = (type:string, pseudo:string = "SYSTEM") => {
        const newMsg:Message[] = [];
        for (const m of messages) {
            if (m.type == type && m.pseudo == pseudo) {
                console.log("clear:",m);
            } else newMsg.push(m);
        }
        setMessages(newMsg);
    }

    // Fonction pour envoyer un message
    const sendMessage = (message: Message) => {
        if (WS && WS.readyState === WebSocket.OPEN) {
            WS.send(JSON.stringify(message));
        } else {
            console.warn("⚠️ WebSocket non connecté");
        }
    };

    return (
        <WSContext.Provider value={{ WS, sendMessage, setMessages, getResponse, getPlayers, getStart, clear, messages, lobby, setLobby, pseudo, setPseudo, picture, setPicture, player, setPlayer, getStartingPage}}>
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