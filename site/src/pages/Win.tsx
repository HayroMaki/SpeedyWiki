import Stat from '../components/win/Stat';
import Podium from '../components/win/Podium';
import ListLooser from '../components/win/ListLooser';
import Cross from "../assets/icon/Cross_Icon.png";
import Full from "../assets/icon/FullScreen_Icon.png";
import Reduce from "../assets/icon/Reduce_Icon.png";
import '../stylesheets/win/Win.css'
import { useEffect, useState } from 'react';
import { useWS } from '../components/WSContext';
import MessageUser from '../interfaces/MessageUser';

const Win = () => {
    const { sendMessage,messages, pseudo,picture, player,lobby: lobbyId, setPlayer, getWinner} = useWS();
    const [winners, setWinners] = useState<{ pseudo: string,image:number, clicks: string  }[]>([]);
    const [loosers, setLoosers] = useState<{ pseudo: string,image:number, clicks: string  }[]>([]);
    useEffect(() => {
        if (player) {  
            sendMessage({
                type: 'WIN', 
                lobby: lobbyId,
                pseudo: pseudo,
                image: picture,
                text: String(player.clicks ?? 0)
            } as MessageUser);
        }
      });

      useEffect(() => {
        checkWinners();
     },[messages]);
    const checkWinners = () => {
        try {
            const winnerplayer = getWinner;
            if (Array.isArray(winnerplayer)) {
                // Prendre les 3 premiers gagnants sans trier
                const winners = winnerplayer.slice(0, 3).map((winner: { pseudo: string,image:number, clicks: string}) => ({
                    pseudo: winner.pseudo,
                    image: winner.image,
                    clicks: winner.clicks
                }));
                const loosers = winnerplayer.slice(3).map((winner: { pseudo: string,image:number, clicks: string}) => ({
                    pseudo: winner.pseudo,
                    image: winner.image,
                    clicks: winner.clicks
                }));
                setWinners(winners);
                setLoosers(loosers);
                
            }
        } catch (error) {
            console.error("Error parsing message:", error);
        }
    }
    return (
        <>
            <div className="winPage-container">
                <div className="winPage-Upper">
                    <Stat/>
                    <Podium winners={winners}/>
                    <ListLooser loosers={loosers}/>
                </div>
                <div className="winPage-Lower">
                    <div className='Button-container'>
                        <div className="Button-top">
                                <div className="icons-container">
                                    <img className='icon' src={Reduce}></img>
                                    <img className='icon' src={Full}></img>
                                    <img className='icon' src={Cross}></img>
                                </div>
                        </div>  
                        <div className='Button-content'>
                            <button className='button'>Lobby</button>
                        </div>
                    </div>
                    <div className='Button-container'>
                        <div className="Button-top">
                                <div className="icons-container">
                                    <img className='icon' src={Reduce}></img>
                                    <img className='icon' src={Full}></img>
                                    <img className='icon' src={Cross}></img>
                                </div>
                        </div>  
                        <div className='Button-content'>
                            <button className='button'>New Game</button>
                        </div>
                    </div>
                </div>
            </div> 
        </>
    )
}

export default Win
