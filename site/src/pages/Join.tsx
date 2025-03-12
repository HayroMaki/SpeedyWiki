import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';

import FooterWindow from '../components/home/FooterWindow.tsx';

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useWS } from '../components/WSContext.tsx';

import '../stylesheets/Join.css'

interface Connexion {
    link : string;
}

const Join: React.FC = () => {
    const [formData, setFormData] = useState<Connexion>({ link: "" });
    const nav = useNavigate();
    const {lobby ,setLobby} = useWS();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ link: e.target.value });
      const url = window.location.href;
        const urlParams = new URLSearchParams(url.substring(url.indexOf("?")));
        if (urlParams.has("game")) {
            const paramValues = urlParams.get("game");
            if (paramValues !== null) {
                console.log(paramValues);
                setLobby(paramValues);
                console.log(lobby);
            }
        }
    };
  
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const link = formData.link;
        setLobby(link);
        nav("/Selection?game=" + link);
    };

    return ( 
        <>
            <div className="join">
                <h1 className="title">SpeedyWiki</h1>
                <br/>
                <div className="join-container">
                    <div className="join-top">
                        <div className="icons-container">
                            <img className='icon' src={Reduce}></img>
                            <img className='icon' src={Full}></img>
                            <img className='icon' src={Cross}></img>
                        </div>
                    </div>
                    <div className="join-content">
                        <h1>To join a lobby, click on the invitation link or enter the lobby Id here :</h1>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    required placeholder="Ex : E3DJ36"/>
                            <button className='button join-button' type='submit'>Continue</button>
                        </form>
                    </div>
                </div>
                <FooterWindow/>
            </div>
        </>
    )
};

export default Join