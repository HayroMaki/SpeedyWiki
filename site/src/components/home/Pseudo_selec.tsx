import { useEffect, useState } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import { useWS } from '../../components/WSContext.tsx';

import Message from "../../interfaces/Message.tsx";

const PseudoSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {messages, sendMessage, getResponse, setMessages, lobby, setLobby, pseudo, setPseudo} = useWS();

    const [waitingForResponse, setWaitingForResponse] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const [checkDone, setCheckDone] = useState(false);

    // Verify the URL GET lobby value :
    useEffect(() => {
        if (lobby === undefined) {
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
                console.log("Vérification de l'existence du lobby :", gameId);
                setCheckDone(true);
            } else {
                console.warn("Paramètre 'game' invalide ou manquant.");
            }
        }
    }, [location.search]);

    // Wait for the server's response :
    useEffect(() => {
        if (!checkDone) return;
        const response = getResponse();
        if (response && response.text === "OK") {
            setLobby(response.lobby);
            console.log("Valid lobby :", response.lobby);
        } else if (response) {
            console.warn("Invalid lobby :", response.lobby);
            navigate("/Join?error=invalid");
        }
        setCheckDone(false);
    }, [messages]);


    // Asks the server the permission to enter the lobby :
    const handleStart = () => {
        if (pseudo.trim() !== "") {
            const message:Message = {
                type: "lobby",
                lobby: lobby,
                pseudo: pseudo,
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
                navigate("/game");
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
