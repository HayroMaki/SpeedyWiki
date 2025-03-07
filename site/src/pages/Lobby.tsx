import "../stylesheets/lobby/Lobby.css"

import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';

import {useState} from "react";

import {User} from "../interfaces/User.tsx";

import {PlayerListWindow} from "../components/lobby/PlayerListWindow.tsx";
import ChatWindow from "../components/lobby/ChatWindow.tsx";
import {LinkWindow} from "../components/lobby/LinkWindow.tsx";
import {ExitWindow} from "../components/lobby/ExitWindow.tsx";

export const Lobby = () => {
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

    const exUserList:User[] = [exUser1,exUser2];

    const [players, setplayers] = useState(exUserList);
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
                            <div className="lobby-window-container">
                                <div className="lobby-window-top">
                                    <div className="icons-container">
                                        <img className='icon' src={Reduce}></img>
                                        <img className='icon' src={Full}></img>
                                        <img className='icon' src={Cross}></img>
                                    </div>
                                </div>
                                <div className="lobby-window-content">
                                    <h1>Waiting for host...</h1>
                                </div>
                            </div>
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