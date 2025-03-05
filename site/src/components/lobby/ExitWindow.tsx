import Reduce from "../../assets/icon/Reduce_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Cross from "../../assets/icon/Cross_Icon.png";
import Exit from "../../assets/icon/Exit_Icon_no_bg.png";
import { useNavigate } from "react-router-dom";

export const ExitWindow = () => {
    const nav = useNavigate();
    
    const handleClick = (event) => {
        event.preventDefault();
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