import "../stylesheets/lobby/Lobby.css"

import {useState} from "react";

import {User} from "../interfaces/User.tsx";

import {PlayerListWindow} from "../components/lobby/PlayerListWindow.tsx";
import {ChatWindow} from "../components/lobby/ChatWindow.tsx";
import {LinkWindow} from "../components/lobby/LinkWindow.tsx";
import {ExitWindow} from "../components/lobby/ExitWindow.tsx";

export const Lobby = () => {
    const [players, setplayers] = useState([]);
    const [host, setHost] = useState(false);
    const [lobby, setLobby] = useState("");

    return (
        <>
            <div className="lobby">
                <div className="lobby-side">
                    <PlayerListWindow players={players}/>
                    <ChatWindow/>
                </div>
                <div className="lobby-content">
                    <div className="lobby-middle">
                        {host ? (
                            <></>
                        ):(
                            <></>
                        )}
                    </div>
                    <div className="lobby-bottom">
                        <LinkWindow link={lobby}/>
                        <ExitWindow/>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Lobby;