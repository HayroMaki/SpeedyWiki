import {useState} from "react";

import {PlayerListWindow} from "../components/lobby/PlayerListWindow.tsx";
import {ChatWindow} from "../components/lobby/ChatWindow.tsx";

export const Lobby = () => {
    const [users, setUsers] = useState([]);
    const [host, setHost] = useState(false);

    return (
        <>
            <div className="game-page">
                <div className="game-page-side">
                    <PlayerListWindow/>
                    <ChatWindow/>
                </div>
                <div className="game-page-content">


                </div>
            </div>
        </>
    );
};
export default Lobby;