import Stat from '../components/win/Stat';
import Podium from '../components/win/Podium';
import ListLooser from '../components/win/ListLooser';
import Cross from "../assets/icon/Cross_Icon.png";
import Full from "../assets/icon/FullScreen_Icon.png";
import Reduce from "../assets/icon/Reduce_Icon.png";
import '../stylesheets/win/Win.css'

const Win = () => {
    return (
        <>
        <div className="winPage-container">
        
        <div className="winPage-Upper">
            <Stat/>
            <Podium/>
            <ListLooser/>
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