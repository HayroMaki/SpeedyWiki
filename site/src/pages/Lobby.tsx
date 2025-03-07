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

const exUserList:User[] = [exUser1,exUser2,exUser3,exUser4,exUser5,exUser6,exUser7];

export const Lobby = () => {
    const [players, setplayers] = useState(exUserList);
    const [host, setHost] = useState(true);
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