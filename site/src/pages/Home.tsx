import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';
import FooterWindow from '../components/home/FooterWindow.tsx';
import '../stylesheets/Home.css'
import { NavLink} from "react-router-dom";

const Home = () => {
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
                        <NavLink to="Selection" className="home_button">Create !</NavLink>
                        <NavLink to="/Join" className="home_button">Join !</NavLink>
                    </div>
                </div>
            </div>
            <FooterWindow/>
        </div>
        </>
        )
};

export default Home;

