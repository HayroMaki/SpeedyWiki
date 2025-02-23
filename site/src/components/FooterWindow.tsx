import "../stylesheets/footer.css";

import Cross from '../assets/Icon/Cross_Icon.png';
import Full from '../assets/Icon/FullScreen_Icon.png';
import Reduce from '../assets/Icon/Reduce_Icon.png';

const FooterWindow = () => {
    return ( 
        <div className="footer-container">
            <div className="footer-top">
                <div className='footer-about-container'>
                    <button className='button footer-button'>About us</button>
                </div>
                <div className="icons-container">
                    <img className='icon' src={Reduce}></img>
                    <img className='icon' src={Full}></img>
                    <img className='icon' src={Cross}></img>
                </div>
            </div>
            <div className="footer-content">
                <a className='footer-copyright'>Copyright</a>
            </div>
        </div>
        )
};

export default FooterWindow;

