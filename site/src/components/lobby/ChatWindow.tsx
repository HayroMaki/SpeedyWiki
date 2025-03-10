import React, { useState } from "react";

import "../../stylesheets/lobby/chatWindow.css";

import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";

import {useWS} from "../WSContext";

import Message from "../../interfaces/Message";

interface ChatWindowProps {
    toggleContent?: (() => void) | null; 
  }
  const ChatWindow: React.FC<ChatWindowProps> = ({ toggleContent }) => {
    const [chat, setChat] = useState<string>("");
    const {WS, sendMessage, messages, lobby, pseudo} = useWS();
    

    const handleSendMessage = () => {
        if (WS && chat) {
            const message:Message = {
                type: "chat",
                lobby: lobby,
                pseudo: pseudo,
                text: chat,
            }
            sendMessage(message);
            console.log(message);
            setChat("");
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
                    {messages.map((msg, index) => {
                        switch (msg.type) {
                            case "chat":
                                return (
                                    <div key={index}>
                                        <strong>{msg.pseudo} :</strong> {msg.text}
                                    </div>
                                );

                            case "chat-sys":
                                return (
                                    <div key={index} style={{color:"#FFFFAA"}}>
                                        {msg.text}
                                    </div>
                                );

                            default:
                                break;
                        }
                    })}
                </div>
                <div className="chat-input-container">
                    <input
                        type="text"
                        value={chat}
                        className="chat-input"
                        onChange={(e) => setChat(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault(); // Can't send an empty chat
                                handleSendMessage(); // Sends the chat
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
