import Reduce from "../../assets/icon/Reduce_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Cross from "../../assets/icon/Cross_Icon.png";
import Link from "../../assets/icon/Link_Icon_no_bg.png";
import {MouseEvent} from "react";

import {Notification} from "../tools/Notification.tsx";
import {useNotification} from "../tools/useNotification.tsx";

export const LinkWindow = (props: {link: string}) => {
    const {visible, text, showNotification} = useNotification();

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        navigator.clipboard.writeText(props.link).then(
            () => {showNotification(<div>Link successfully copied to clipboard !<br/>Send it to your friends !</div>, 3000);},
            () => {showNotification(<div>Could not copy the link to clipboard...<br/>Sorry... :(</div>, 3000);}
        );
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
                        <img src={Link} alt=""/>
                        Invite
                    </button>
                </div>
            </div>
            <Notification visible={visible} text={text}/>
        </>
    )
}