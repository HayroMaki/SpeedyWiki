import "../../stylesheets/lobby/playerListWindow.css"

import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";

export const PlayerListWindow = () => {
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
                        <ul id="player-list-players">
                            {
                            // Mettre la liste des joueurs ici...
                            }
                        </ul>
                    </div>
                    <div className="player-list-bottom-spacer"></div>
                </div>
            </div>
        </>
    )
}

export default PlayerListWindow;