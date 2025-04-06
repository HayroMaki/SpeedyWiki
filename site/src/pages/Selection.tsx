import "../stylesheets/home/footerWindow.css";
import "../stylesheets/Selection.css"

import Footer from '../components/home/FooterWindow.tsx';
import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';
import PicSelect from '../components/home/Pic_selec.tsx';
import PseudoSelection from "../components/home/Pseudo_selec.tsx";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useWS } from "../components/WSContext"; // Ajustez le chemin

const Selection: React.FC = () => {
    const [searchParams] = useSearchParams();
    const lobbyId = searchParams.get("game") || "";
    const { sendMessage, messages, pseudo } = useWS();
    const [joinAttempted, setJoinAttempted] = useState(false);

    // Tenter de rejoindre le lobby avec un léger délai
    useEffect(() => {
        if (!lobbyId || joinAttempted) return;

        // Attendre un peu avant de tenter de rejoindre le lobby
        const timer = setTimeout(() => {
            console.log("Tentative de rejoindre le lobby:", lobbyId);

            // Vérifier d'abord si le lobby existe
            sendMessage({
                type: "lobby",
                pseudo: pseudo || "User",
                text: "CHECK",
                lobby: lobbyId
            });

            setJoinAttempted(true);
        }, 500); // Délai de 500ms

        return () => clearTimeout(timer);
    }, [lobbyId, joinAttempted, pseudo, sendMessage]);

    // Observer les réponses après vérification du lobby
    useEffect(() => {
        if (!joinAttempted) return;

        const response = messages.find(m =>
            m.type === "response-sys" &&
            m.pseudo === "SYSTEM" &&
            (m.text === "OK" || m.text === "KO")
        );

        if (response) {
            if (response.text === "OK") {
                console.log("Lobby trouvé, tentative de rejoindre");
                // Le lobby existe, on peut le rejoindre
                sendMessage({
                    type: "lobby",
                    pseudo: pseudo || "User",
                    text: "JOIN",
                    lobby: lobbyId
                });
            } else {
                console.log("Lobby non trouvé (KO):", lobbyId);
                // Gérer le cas où le lobby n'existe pas
                alert("Le lobby n'a pas pu être trouvé. Veuillez vérifier le code ou créer un nouveau lobby.");
            }
        }
    }, [messages, joinAttempted, lobbyId, pseudo, sendMessage]);
    return ( 
        <>
            <div className="selection">
                <h1 className="title">SpeedyWiki</h1>
                <br />
                <div className="selection-container">
                    <div className="selection-top">
                        <div className="icons-container">
                            <img className='icon' src={Reduce}></img>
                            <img className='icon' src={Full}></img>
                            <img className='icon' src={Cross}></img>
                        </div>
                    </div>
                    <div className="selection-content">
                        <h1>Choose a character :</h1>
                        <div className='pic-selection'>
                            <PicSelect/>
                        </div>
                        <h1>And a name :</h1>
                        <PseudoSelection/>
                    </div>
                </div>
                <Footer/>
            </div>
        </>
        )
};

export default Selection;