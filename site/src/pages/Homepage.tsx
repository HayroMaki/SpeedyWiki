import Cross from '../assets/Icon/Cross_Icon.png';
import Full from '../assets/Icon/FullScreen_Icon.png';
import Reduce from '../assets/Icon/Reduce_Icon.png';
import FooterWindow from '../components/FooterWindow.tsx';
import '../stylesheets/homePage.css'
import { NavLink} from "react-router-dom";

const Homepage = () => {
    return ( 
        <>
        <div className="homePage-container">
            <h1 className="title">SpeedyWiki</h1>
            <br />
            <div className="homePage-size">

                <div className="homePage-top">
                    <div className="homePage_icons-container">
                        <img className='icon' src={Reduce}></img>
                        <img className='icon' src={Full}></img>
                        <img className='icon' src={Cross}></img>
                    </div>
                </div>

                <div className="homePage-content">

                    <h1>Create or Join an online lobby !</h1>
                    <div className="button_links">
                        <NavLink to="/NameSelectionHost"className="home_button">Create !</NavLink>
                        <NavLink to="/Join" className="home_button">Join !</NavLink>
                    </div>

                </div>
            </div>
        </div>
        <div className='Footer'>
            <FooterWindow />
        </div>
        </>
        )
};

export default Homepage;

