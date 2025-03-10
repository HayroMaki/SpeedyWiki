import { useNavigate } from "react-router-dom";
import { useWS } from '../../components/WSContext.tsx';

import Message from "../../interfaces/Message.tsx";

const PseudoSelection = () => {
    const navigate = useNavigate();
    const {sendMessage, lobby, pseudo, setPseudo} = useWS();

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
            navigate("/Game"); // Redirige vers le lobby ou la partie.
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
