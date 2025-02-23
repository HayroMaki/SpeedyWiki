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

                    <h1 className="text-[32px] md:text-[48px] p-5">Create or Join an online lobby !</h1>
                    <div className="gap-4 item-end flex flex-row flex-wrap justify-center md:gap-60">
                        <NavLink to="/NameSelectionHost"className="bouton text-[32px] md:text-[48px] w-[240px]">Create !</NavLink>
                        <NavLink to="/Join" className="bouton text-[32px] md:text-[48px] w-[240px]">Join !</NavLink>
                    </div>

                </div>
            </div>
        </div>
        <div className='absolute bottom-0 w-[100%]'>
            <FooterWindow />
        </div>
        </>
        )
};

export default Homepage;

