import React, { useState } from "react";

import "../../stylesheets/lobby/chatWindow.css";

import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";

import useRunOnce from "../tools/useRunOnce.tsx";

interface ChatWindowProps {
    toggleContent?: (() => void) | null; 
  }
  const ChatWindow: React.FC<ChatWindowProps> = ({ toggleContent }) => {
    const pseudo = localStorage.getItem("pseudo") || "Anonyme"; // Récupère le pseudo
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<{ pseudo: string; text: string }[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useRunOnce({
        fn: () => {
            if (!ws) {  // If there is already a connection opened
                const socket = new WebSocket("ws://localhost:3002");
                setWs(socket);

                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    setMessages((prev) => [...prev, data]);
                };

                socket.onopen = () => console.log("✅ WebSocket connecté");
                socket.onerror = (error) => console.error("❌ Erreur WebSocket :", error);
                socket.onclose = (event) => console.warn("⚠️ WebSocket fermé :", event.reason);

                return () => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.close();
                    }
                };
            }
        } // Avoids the possibility of multiple connections.
    })

    const handleSendMessage = () => {
        if (ws && message) {
            ws.send(JSON.stringify({ pseudo, text: message }));
            setMessage("");
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-top">
                <div className="icons-container">
                    <img className="icon" src={Reduce} alt="Réduire" />
                    <img className="icon" src={Full} alt="Plein écran" />
                    <img className="icon" src={Cross} alt="Fermer" />
                </div>
            </div>
            <div className="chat-content">
                <div className="chat-content-top">
                    <h1 className="chat-title">Chat :</h1>
                    <button className="chat-button button" onClick={() => toggleContent && toggleContent()}>Objectif</button>
                </div>
                <div id="Chat" className="chat-box">
                    {messages.map((msg, index) => (
                        <div key={index}>
                            <strong>{msg.pseudo} :</strong> {msg.text}
                        </div>
                    ))}
                </div>
                <div className="chat-input-container">
                    <input
                        type="text"
                        value={message}
                        className="chat-input"
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault(); // Can't send an empty message
                                handleSendMessage(); // Sends the message
                            }
                        }}
                        placeholder="Chat here..."
                    />

                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
