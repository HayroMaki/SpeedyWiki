import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';
import FooterWindow from '../components/home/FooterWindow.tsx';
import '../stylesheets/Home.css'
import {NavLink} from "react-router-dom";
import {useNavigate} from 'react-router-dom';

const Home = () => {
    const nav = useNavigate();

    function createLobby()

    const handleClick = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        // TODO : create a lobby and return it's connexion code.
        nav("/Selection?game=123456");
    }

    return ( 
        <>
        <div className="homePage">
            <h1 className="title">SpeedyWiki</h1>
            <br/>
            <div className="homePage-container">
                <div className="homePage-top">
                    <div className="icons-container">
                        <img className='icon' src={Reduce}></img>
                        <img className='icon' src={Full}></img>
                        <img className='icon' src={Cross}></img>
                    </div>
                </div>
                <div className="homePage-content">
                    <h1>Create or Join an online lobby !</h1>
                    <div className="button_links">
                        <button className="home_button button" onClick={handleClick}>Create !</button>
                        <NavLink to="/Join" className="home_button button">Join !</NavLink>
                    </div>
                </div>
            </div>
            <FooterWindow/>
        </div>
        </>
        )
};

export default Home;

