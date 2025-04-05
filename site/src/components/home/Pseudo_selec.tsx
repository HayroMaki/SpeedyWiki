import { useNavigate } from "react-router-dom";
import { useWS } from '../../components/WSContext.tsx';

import Message from "../../interfaces/Message.tsx";

const PseudoSelection = () => {
    const navigate = useNavigate();
    const {messages, sendMessage, getResponse, setMessages, lobby, pseudo, setPseudo} = useWS();

    const handleStart = () => {
        if (pseudo.trim() !== "") {
            const message:Message = {
                type: "lobby",
                lobby: lobby,
                pseudo: pseudo,
                text: "JOIN",
            }
            sendMessage(message);
            console.log(message);
            const checker = setInterval(() => {
                const m = getResponse();
                if (m) {
                    if (m.text == "OK") {
                        // Delete m using setMessages.
                        navigate("/game");
                    } else {
                        console.log(m);
                        // Delete m using setMessages.
                        clearTimeout(timeout);
                    }
                }
            }, 200);

            const timeout = setTimeout(() => {
                clearInterval(checker);
                console.log("Unable to connect.");
            },5000);
        }
    };

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
