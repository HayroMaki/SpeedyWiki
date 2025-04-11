import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';

import useRunOnce from "../components/tools/useRunOnce.tsx";
import FooterWindow from '../components/home/FooterWindow.tsx';
import CreateLobby from '../components/lobby/CreateLobby.tsx'; // Assurez-vous que le chemin est correct

import '../stylesheets/Home.css'

import {NavLink} from "react-router-dom";

const Home = () => {
    useRunOnce({fn:() => {
        localStorage.clear();
        }
    })

    return (
        <>
            <div className="homePage">
                <h1 className="title">SpeedyWiki</h1>
                <br/>
                <div className="homePage-container">
                    <div className="homePage-top">
                        <div className="icons-container">
                            <img className='icon' src={Reduce} alt="Reduce" />
                            <img className='icon' src={Full} alt="Full Screen" />
                            <img className='icon' src={Cross} alt="Close" />
                        </div>
                    </div>
                    <div className="homePage-content">
                        <h1>Create or Join an online lobby !</h1>
                        <div className="button_links">
                            {/* Utiliser le composant sans passer de className */}
                            <CreateLobby />
                            <NavLink to="/Join" className="home_button button">Join !</NavLink>
                        </div>
                    </div>
                </div>
                <FooterWindow/>
            </div>
        </>
    );
};

export default Home;