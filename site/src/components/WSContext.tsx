import React, { createContext, useState, useContext, ReactNode } from "react";
import useRunOnce from "./tools/useRunOnce";
import Message from "../interfaces/Message";
import User from "../interfaces/User";
import MessageUser from "../interfaces/MessageUser.tsx";

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
    getWinner:() => Message | null;
    clear: (type:string, pseudo:string) => void;
    lobby: string;
    setLobby: React.Dispatch<React.SetStateAction<string>>;
    pseudo: string;
    setPseudo: React.Dispatch<React.SetStateAction<string>>;
    picture: number;
    setPicture: React.Dispatch<React.SetStateAction<number>>;
    player : User | null;
    setPlayer: React.Dispatch<React.SetStateAction<User | null>>;
    actualPage: string;
    setActualPage: React.Dispatch<React.SetStateAction<string>>;

}

const WSContext = createContext<WSContextType | undefined>(undefined);

export const WSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [WS, setWS] = useState<WebSocket | null>(null);
    const [lobby, setLobby] = useState<string>(() => localStorage.getItem("lobby") || "");
    const [pseudo, setPseudo] = useState<string>(() => localStorage.getItem("pseudo") || "");
    const [picture, setPicture] = useState<number>(() => parseInt(localStorage.getItem("picture") || "0"));
    const [player, setPlayer] = useState<User | null>(() => {
        const stored = localStorage.getItem("player");
        return stored ? JSON.parse(stored) : [];
    });
    const [messages, setMessages] = useState<Message[]>(() => {
        const stored = localStorage.getItem("messages");
        return stored ? JSON.parse(stored) : [];
    });
    const [actualPage, setActualPage] = useState<string>(() => {
        console.log(localStorage.getItem("actualpage"));
        return localStorage.getItem("actualpage") || ""
    });

    React.useEffect(() => {
        localStorage.setItem("lobby", lobby);
    }, [lobby]);

    React.useEffect(() => {
        localStorage.setItem("pseudo", pseudo);
    }, [pseudo]);

    React.useEffect(() => {
        localStorage.setItem("picture", picture.toString());
    }, [picture]);

    React.useEffect(() => {
        localStorage.setItem("player", JSON.stringify(player));
    }, [player]);

    React.useEffect(() => {
        localStorage.setItem("messages", JSON.stringify(messages));
    }, [messages]);

    React.useEffect(() => {
        localStorage.setItem("actualpage", actualPage);
    }, [actualPage]);

    useRunOnce({
        fn: () => {
            if (!WS) {
                const host = window.location.hostname;
                const defaultWsScheme = window.location.protocol === "https:" ? "wss" : "ws";
                const socketUrl = import.meta.env.VITE_WS_URL || `${defaultWsScheme}://${host}:3002`;
                const socket = new WebSocket(socketUrl);

                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    console.log("received :",data);
                    setMessages((prev) => [...prev, data]);
                };

                socket.onopen = () => {
                    if (window.location.hash =="#/Lobby" || window.location.hash == "#/Game") {
                        console.log("checking for possible reconnection...")
                        const storedPseudo = localStorage.getItem("pseudo");
                        const storedLobby = localStorage.getItem("lobby");
                        if (storedLobby && storedLobby.length === 6) {
                            const checkMessage: Message = {
                                type: "lobby",
                                lobby: storedLobby,
                                pseudo: "",
                                text: "CHECK"
                            };
                            console.log("Reconnection : lobby verification...");
                            socket.send(JSON.stringify(checkMessage));

                            // Waiting for check response to reconnect :
                            const checkInterval = setInterval(() => {
                                const response = getResponse();
                                if (response) {
                                    clearInterval(checkInterval);
                                    clearTimeout(failTimeout);

                                    if (response.text === "OK") {
                                        console.log("Valid Lobby :", storedLobby);
                                        const joinMessage: MessageUser = {
                                            type: "lobby",
                                            lobby: storedLobby,
                                            pseudo: storedPseudo || "",
                                            image: picture,
                                            text: "JOIN"
                                        };
                                        socket.send(JSON.stringify(joinMessage));
                                        setLobby(storedLobby);
                                        setPseudo(storedPseudo || "");
                                    } else {
                                        console.warn("Invalid Lobby :", storedLobby);
                                        setMessages([]);
                                        localStorage.removeItem("lobby");
                                        localStorage.removeItem("pseudo");
                                        window.location.replace("/");
                                    }
                                    clear("response-sys", "SYSTEM");
                                }
                            }, 200);

                            const failTimeout = setTimeout(() => {
                                clearInterval(checkInterval);
                                console.warn("Timeout Lobby Check.");
                                setMessages([]);
                                localStorage.removeItem("lobby");
                                localStorage.removeItem("pseudo");
                                window.location.replace("/");
                            }, 5000);
                        }
                    } else {
                        localStorage.removeItem("actualpage");
                        localStorage.removeItem("inventory");
                        localStorage.removeItem("snail");
                        localStorage.removeItem("player");
                        setActualPage("");
                        setPlayer(null)
                    }
                };
                socket.onerror = (error) => console.error("❌ WebSocket Error :", error);
                socket.onclose = (event) => console.warn("⚠️ WebSocket Closed :", event.reason);

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
                console.log(m);
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
                return m;
            }
        }
        return null;
    }

    const getWinner = () => {
        for (const m of messages) {
            if (m.type == "WIN" && m.pseudo == "SYSTEM") {
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

    const sendMessage = (message: Message | MessageUser) => {
        if (WS && WS.readyState === WebSocket.OPEN) {
            WS.send(JSON.stringify(message));
        } else {
            console.warn("⚠️ WebSocket non connected");
        }
    };

    return (
        <WSContext.Provider value={{ WS, sendMessage, setMessages, getResponse, getPlayers, getStart, clear, messages, lobby, setLobby, pseudo, setPseudo, picture, setPicture, player, setPlayer, getStartingPage, actualPage, setActualPage, getWinner}}>
            {children}
        </WSContext.Provider>
    );
};

export const useWS = () => {
    const context = useContext(WSContext);
    if (!context) {
        throw new Error("useWS must be used within the WSContext.");
    }
    return context;
};