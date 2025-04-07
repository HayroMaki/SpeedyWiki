import "../../stylesheets/lobby/playerListWindow.css"

import {User} from "../../interfaces/User"

import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";

import PP1 from '../../assets/image/char/Char1.png';
import PP2 from '../../assets/image/char/Char2.png';
import PP3 from '../../assets/image/char/Char3.png';
import PP4 from '../../assets/image/char/Char4.png';
import PP5 from '../../assets/image/char/Char5.png';
import PP6 from '../../assets/image/char/Char6.png';
import PP7 from '../../assets/image/char/Char7.png';
import PP8 from '../../assets/image/char/Char8.png';
import PP9 from '../../assets/image/char/Char9.png';

const PP:string[] = [PP1,PP2,PP3,PP4,PP5,PP6,PP7,PP8,PP9];

export const PlayerListWindow = (props : {players: User[]}) => {
    
    return (
        <>
            <div className="player-list-container">
                <div className="player-list-top">
                    <div className="icons-container">
                        <img className='icon' src={Reduce}></img>
                        <img className='icon' src={Full}></img>
                        <img className='icon' src={Cross}></img>
                    </div>
                </div>
                <div className="player-list-content">
                    <h1 className="player-list-title">Players : {props.players.length}/X</h1>
                    <div className="player-list-players-container">
                        <ul className="player-list-players">
                            {props.players.map((player) => { 
                                const style = {color:player.color}
                                return (
                                    <li className="player-list-line" style={style} key={player.id}>
                                        <img className="player-list-players-image" src={PP[player.picture - 0]} alt=""/>
                                        <div className="player-list-players-name">{player.name}</div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="player-list-bottom-spacer"></div>
                </div>
            </div>
        </>
    )
}

export default PlayerListWindow;