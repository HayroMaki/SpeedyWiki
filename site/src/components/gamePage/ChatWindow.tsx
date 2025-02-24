import "../../stylesheets/gamePage/chatWindow.css";

import Cross from "../../assets/Icon/Cross_Icon.png";
import Full from "../../assets/Icon/FullScreen_Icon.png";
import Reduce from "../../assets/Icon/Reduce_Icon.png";

export const ChatWindow = () => {
    return (
        <>
            <div className="chat-container">
                <div className="chat-top">
                    <div className="icons-container">
                        <img className="icon" src={Reduce} alt="Réduire"/>
                        <img className="icon" src={Full} alt="Plein écran"/>
                        <img className="icon" src={Cross} alt="Fermer"/>
                    </div>
                </div>
                <div className="chat-content">
                    <h1 className="chat-title">Chat :</h1>
                    <div id="Chat" className="chat-box">
                        Truc
                    </div>
                    <div className="chat-input-container">
                        <input type="text" className="chat-input" placeholder="Chat here..."/>
                    </div>
                </div>
            </div>

        </>
    )
}
export default ChatWindow;