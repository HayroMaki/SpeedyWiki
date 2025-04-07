import { useEffect, useState } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import { useWS } from '../WSContext.tsx';

import Message from "../../interfaces/Message.tsx";
import MessageUser from "../../interfaces/MessageUser.tsx";

const PseudoSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {messages, sendMessage, getResponse, setMessages, lobby, setLobby, pseudo, setPseudo, picture} = useWS();

    const [waitingForResponse, setWaitingForResponse] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const [checkDone, setCheckDone] = useState(false);
    const [tempLobby, setTempLobby] = useState("");

    // Verify the URL GET lobby value :
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const gameId = params.get("game");

        if (gameId && gameId.length === 6) {
            const checkMessage: Message = {
                type: "lobby",
                lobby: gameId,
                pseudo: "",
                text: "CHECK"
            };
            sendMessage(checkMessage);
            setCheckDone(true);
            setTempLobby(gameId);
        }
    }, [location.search]);

    // Wait for the server's response :
    useEffect(() => {
        if (!checkDone) return;
        const response = getResponse();
        console.log("response:",response);
        if (response && response.text === "OK") {
            setLobby(tempLobby);
            setMessages([]);
            console.log("Valid lobby :", lobby);
        } else if (response) {
            console.warn("Invalid lobby :", tempLobby);
            setMessages([]);
            navigate("/Join?error=invalid");
        }
        setCheckDone(false);
    }, [messages]);


    // Asks the server the permission to enter the lobby :
    const handleStart = () => {
        if (pseudo.trim() !== "") {
            
            const message:MessageUser = {
                type: "lobby",
                lobby: lobby,
                pseudo: pseudo,
                image: picture,
                text: "JOIN",
            }
            sendMessage(message);

            // Timeout in case the server does not respond in under 10 seconds :
            const tm = setTimeout(() => {
                console.log("Unable to connect.");
                setWaitingForResponse(false);
            }, 10000);
            setTimeoutId(tm);
            setWaitingForResponse(true);
        }
    };

    // Wait for the server's response :
    useEffect(() => {
        if (!waitingForResponse) return;
        const m = getResponse();
        if (m) {
            console.log("response :", m);
            if (m.text === "OK") {
                if (timeoutId) clearTimeout(timeoutId);
                setMessages([]);
                navigate("/Lobby");
            } else {
                if (timeoutId) clearTimeout(timeoutId);
                setMessages([]);
            }
            setWaitingForResponse(false);
        }
    }, [messages, waitingForResponse]);

    return (
        <div>
            <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleStart();
                    }
                }}
                placeholder="xX_CoolAssUserName_Xx"
                className="Pseudo_input"
            />
        </div>

    );
};

export default PseudoSelection;
