import "../../stylesheets/tools/notification.css";

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
            {text}
        </div>
    );
}
export default Notification;