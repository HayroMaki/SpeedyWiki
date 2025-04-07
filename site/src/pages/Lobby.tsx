import "../stylesheets/lobby/Lobby.css";
import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {User} from "../interfaces/User.tsx";
import {PlayerListWindow} from "../components/lobby/PlayerListWindow.tsx";
import ChatWindow from "../components/lobby/ChatWindow.tsx";
import {LinkWindow} from "../components/lobby/LinkWindow.tsx";
import {ExitWindow} from "../components/lobby/ExitWindow.tsx";
import {useWS} from "../components/WSContext.tsx";
const exUser1: User = {
    id:1,
    name:"Johny",
    picture:2,
    color:"#1F3A62",
    current_page:"...",
    clicks:4,
    pages:[],
    items:[],
    item_used:0
}
const exUser2: User = {
    id:2,
    name:"Joseph",
    picture:6,
    color:"#BB124C",
    current_page:"...",
    clicks:2,
    pages:[],
    items:[],
    item_used:0
}
const exUser3: User = {
    id:3,
    name:"Jonathan",
    picture:4,
    color:"#1149C2",
    current_page:"...",
    clicks:2,
    pages:[],
    items:[],
    item_used:0
}
const exUser4: User = {
    id:4,
    name:"George",
    picture:1,
    color:"#FFFF11",
    current_page:"...",
    clicks:2,
    pages:[],
    items:[],
    item_used:0
}
const exUser5: User = {
    id:5,
    name:"George II",
    picture:8,
    color:"#992817",
    current_page:"...",
    clicks:2,
    pages:[],
    items:[],
    item_used:0
}
const exUser6: User = {
    id:6,
    name:"Jotaro",
    picture:1,
    color:"#111111",
    current_page:"...",
    clicks:2,
    pages:[],
    items:[],
    item_used:0
}
const exUser7: User = {
    id:7,
    name:"Josuke",
    picture:4,
    color:"#AAAABA",
    current_page:"...",
    clicks:2,
    pages:[],
    items:[],
    item_used:0
}

const pictureColorMap: { [key: number]: string } = {
    1: "#1F3A62",   // Bleu foncé
    2: "#BB124C",   // Rouge framboise
    3: "#1149C2",   // Bleu roi
    4: "#FFFF11",   // Jaune vif
    5: "#992817",   // Rouge brique
    6: "#111111",   // Noir
    7: "#AAAABA",   // Gris bleuté
    8: "#3DBF86",   // Vert menthe
    9: "#F28C28",   // Orange doux
  };

const exUserList:User[] = [exUser1,exUser2,exUser3,exUser4,exUser5,exUser6,exUser7];

export const Lobby = () => {
    const navigate = useNavigate();
    //const [players, setPlayers] = useState(exUserList);
    const [isHost, setIsHost] = useState(true); 
    const [players, setPlayers] = useState<User[]>([]);

    const { WS: socket, sendMessage, lobby: lobbyId, pseudo, messages } = useWS();
    
    useEffect(() => {
        if (!socket) {
            console.error("WebSocket connection is not established");
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            try {
                const message = JSON.parse(event.data);
                console.log("Message reçu:", message);

                if (message.type === 'START') {
                    navigate("/Game");
                    return;
                }

                // Ajout d'un joueur à la réception d'un message SYSTEM_USER
                if (message.type === "response-sys" && message.pseudo === "SYSTEM_USER") {
                    const playersList = message.text;  // La liste des joueurs reçue
                    
                    setPlayers(() => {
                        // On transforme la liste reçue en format attendu
                        const updatedPlayers = playersList.map((player: { pseudo: string; image: number; }) => {
                        return {
                            id: player.pseudo,  // Utilise le pseudo comme ID (assurez-vous qu'il soit unique)
                            name: player.pseudo,
                            picture: player.image,
                            color: pictureColorMap[player.image] || "#CCCCCC",  // On assigne la couleur associée à l'image
                            current_page: "...",  // Ajouter les autres valeurs par défaut si besoin
                            clicks: 0,
                            pages: [],
                            items: [],
                            item_used: 0
                        };
                        });

                        return updatedPlayers;
                    });
                    
                }

            } catch (error) {
                console.error("Error parsing message:", error);
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => socket.removeEventListener('message', handleMessage);
    }, [socket, navigate]);

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
                    <LinkWindow link={lobbyId}/> {/* Utilisez lobbyId ici */}
                    <ExitWindow/>
                </div>
            </div>
        </div>
    );
};

export default Lobby;