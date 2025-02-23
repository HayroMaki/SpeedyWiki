import Cross from '../assets/Icon/Cross_Icon.png';
import Full from '../assets/Icon/FullScreen_Icon.png';
import Reduce from '../assets/Icon/Reduce_Icon.png';
import FooterWindow from '../components/FooterWindow.tsx';
import { useState } from "react";
import '../stylesheets/pageJoin.css'

interface Connexion {
    link : string;
}

const Join: React.FC = () => {
    const [formData, setFormData] = useState<Connexion>({ link: "" });
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ link: e.target.value });
    };
  
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log("Lien soumis:", formData.link);
    };

    return ( 
        <>
        <div className="pageJoin-container">
            <h1 className="title">SpeedyWiki</h1>
            <br />
            <div className="pageJoin-size">

                <div className="pageJoin-top">
                    <div className="pageJoin_icons-container">
                        <img className='h-[40px]' src={Reduce}></img>
                        <img className='h-[40px]' src={Full}></img>
                        <img className='h-[40px]' src={Cross}></img>
                    </div>
                </div>

                <div className="pageJoin-content">

                    <h1 className="">To join a lobby, click on the invitation link or enter the lobby Id here :</h1>
                       <form onSubmit={handleSubmit} className="">
                        <input type="text" name="link" className=''
                                value={formData.link}
                                onChange={handleChange}
                                required placeholder='Ex:E3DJ36'/>
                        <button className='button Joinbutton' type='submit'>Continue</button>
                       </form>
                </div>
            </div>
        </div>
        <div className='Footer'>
            <FooterWindow />
        </div>
        </>
        )
};

export default Join