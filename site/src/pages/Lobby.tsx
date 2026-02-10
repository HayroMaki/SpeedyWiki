import "../stylesheets/lobby/Lobby.css";
import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import User from "../interfaces/User.tsx";
import {PlayerListWindow} from "../components/lobby/PlayerListWindow.tsx";
import ChatWindow from "../components/lobby/ChatWindow.tsx";
import {LinkWindow} from "../components/lobby/LinkWindow.tsx";
import {ExitWindow} from "../components/lobby/ExitWindow.tsx";
import {useWS} from "../components/WSContext.tsx";
import useRunOnce from "../components/tools/useRunOnce.tsx";


const pictureColorMap: { [key: number]: string } = {
    1: "#1F3A62",   // Bleu foncé
    2: "#BB124C",   // Rouge framboise
    3: "#1149C2",   // Bleu roi
    4: "#ffd133",   // Jaune vif
    5: "#992817",   // Rouge brique
    6: "#111111",   // Noir
    7: "#AAAABA",   // Gris bleuté
    8: "#3DBF86",   // Vert menthe
    9: "#F28C28",   // Orange doux
};

export const Lobby = () => {
    const navigate = useNavigate();
    const [isHost, setIsHost] = useState(false); 
    const [players, setPlayers] = useState<User[]>([]);
    const { sendMessage, clear, lobby: lobbyId, pseudo, messages, getPlayers, getStart, setPlayer} = useWS();
    console.log(messages);
    useRunOnce({fn:() => {
        checkMessages();
    }});

    useEffect(() => {
       checkMessages();
    },[messages]);

    const checkMessages = () => {
        try {
            const m_start = getStart();
            if (m_start) {
                console.log("found start:",m_start);
                navigate("/Game");
                return;
            }

            const m_players = getPlayers();
            if (m_players) {
                clear("PLAYERS","SYSTEM");
                console.log("Message reçu:", m_players);
                const playersList = m_players.text; 
                console.log(playersList);

                if (playersList && Array.isArray(playersList)) {
                    setPlayers(() => {
                        const mappedPlayers = playersList.map((player): User => {
                            return {
                                id: player.pseudo,
                                name: player.pseudo,
                                picture: player.image,
                                color: pictureColorMap[player.image] || "#CCCCCC",
                                current_page: "...",
                                clicks: 0,
                                pages: [],
                                items: [],
                                item_used: 0
                            };
                        });

                        const matchedPlayer = mappedPlayers.find(p => p.name === pseudo);
                        if (matchedPlayer) {
                            setPlayer(matchedPlayer);
                        }
                        if (mappedPlayers[0]?.name === pseudo) {
                            setIsHost(true);
                        }

                        return mappedPlayers;
                    });
                }
            }
        } catch (error) {
            console.error("Error parsing message:", error);
        }
    }

    const startGame = () => {
        if (!sendMessage) {
            console.error("sendMessage function is not available");
            return;
        }

        sendMessage({
            type: 'lobby', 
            lobby: lobbyId,
            pseudo: pseudo,
            text: "START"
        });
    };

    return (
        <div className="lobby">
            <div className="lobby-side">
                <PlayerListWindow players={players}/>
                <ChatWindow/>
            </div>
            <div className="lobby-content">
                <div className="lobby-middle">
                    {isHost ? (
                        <div className="lobby-window-container">
                            <div className="lobby-window-top">
                                <div className="icons-container">
                                    <img className='icon' src={Reduce} alt="Réduire"/>
                                    <img className='icon' src={Full} alt="Plein écran"/>
                                    <img className='icon' src={Cross} alt="Fermer"/>
                                </div>
                            </div>
                            <div className="lobby-window-content lobby-window-button">
                                <button className="button" onClick={startGame}>Start the game</button>
                            </div>
                        </div>
                    ) : (
                        <div className="lobby-window-container">
                            <div className="lobby-window-top">
                                <div className="icons-container">
                                    <img className='icon' src={Reduce} alt="Réduire"/>
                                    <img className='icon' src={Full} alt="Plein écran"/>
                                    <img className='icon' src={Cross} alt="Fermer"/>
                                </div>
                            </div>
                            <div className="lobby-window-content">
                                <h1>Waiting for host...</h1>
                            </div>
                        </div>
                    )}
                </div>
                <div className="lobby-bottom">
                    <LinkWindow link={lobbyId}/>
                    <ExitWindow/>
                </div>
            </div>
        </div>
    );
};

export default Lobby;