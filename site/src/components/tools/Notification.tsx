import "../../stylesheets/tools/notification.css";

import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";

import {JSX} from "react";

interface Props {
    visible: boolean;
    text: JSX.Element | undefined;
}

export function Notification({visible,  text}: Props): JSX.Element {

    if (!visible) {
        return <></>;
    }

    return (
        <div className="notification">
            <div className="notification-container">
                <div className="notification-top">
                    <div className="icons-container">
                        <img className='icon' src={Reduce}></img>
                        <img className='icon' src={Full}></img>
                        <img className='icon' src={Cross}></img>
                    </div>
                </div>
                <div className="notification-content">
                    <h1>{text}</h1>
                </div>
            </div>
        </div>
    );
}
export default Notification;