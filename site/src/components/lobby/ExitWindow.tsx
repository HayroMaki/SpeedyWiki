import Reduce from "../../assets/icon/Reduce_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Cross from "../../assets/icon/Cross_Icon.png";
import Exit from "../../assets/icon/Exit_Icon_no_bg.png";
import { useNavigate } from "react-router-dom";
import { useWS } from '../WSContext.tsx';
import MessageUser from "../../interfaces/MessageUser.tsx";
export const ExitWindow = () => {
    const nav = useNavigate();
    const {sendMessage, lobby: lobbyId, pseudo, picture } = useWS();
    const handleClick = () => {
        const message:MessageUser = {
            type: "lobby",
            lobby: lobbyId,
            pseudo: pseudo,
            image: picture,
            text: "QUIT",
        }
        sendMessage(message);
        nav("/");
    }

    return (
        <>
            <div className="lobby-bottom-container">
                <div className="lobby-bottom-top">
                    <div className="icons-container">
                        <img className="icon" src={Reduce} alt="Réduire"/>
                        <img className="icon" src={Full} alt="Plein écran"/>
                        <img className="icon" src={Cross} alt="Fermer"/>
                    </div>
                </div>
                <div className="lobby-bottom-content">
                    <button className="lobby-bottom-button button" onClick={handleClick}>
                        <img src={Exit} alt=""/>
                        Exit
                    </button>
                </div>
            </div>
        </>
    )
}