import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PseudoSelection = () => {
    const [pseudo, setPseudo] = useState("");
    const navigate = useNavigate();

    const handleStart = () => {
        if (pseudo.trim() !== "") {
            localStorage.setItem("pseudo", pseudo); // Stocke le pseudo
            navigate("/Game"); // Redirige vers le lobby ou la partie
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
                        e.preventDefault(); // Empêche le retour à la ligne
                        handleStart(); // Envoie le message
                    }
                }}
                placeholder="xX_CoolAssUserName_Xx"
            />
        </div>

    );
};

export default PseudoSelection;
