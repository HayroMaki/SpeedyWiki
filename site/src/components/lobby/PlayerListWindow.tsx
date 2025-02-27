import "../../stylesheets/lobby/playerListWindow.css"

import {User} from "../../interfaces/User"

import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";

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
                    <h1 className="player-list-title">Players :</h1>
                    <div className="player-list-players-container">
                        <ul className="player-list-players">
                            {props.players.map((player) => (
                                <li>
                                    <img src={"../../assets/image/Char" + player.picture + ".png"} alt="player"/>
                                    {player.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="player-list-bottom-spacer"></div>
                </div>
            </div>
        </>
    )
}

export default PlayerListWindow;