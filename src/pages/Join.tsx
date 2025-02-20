import Cross from '../assets/Icon/Cross_Icon.png';
import Full from '../assets/Icon/FullScreen_Icon.png';
import Reduce from '../assets/Icon/Reduce_Icon.png';
import Footer from '../components/Footer';
import { useState } from "react";

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
        <div className="flex flex-col items-center text-center overflow-hidden">
            <h1 className="title text-[90px] md:text-[132px]">SpeedyWiki</h1>
            <br />
            <div className="w-120 md:w-220">

                <div className="h-[50px] bg-[#A2D2F6] border-3 border-[#6d6d6d] flex justify-end items-center">
                    <div className="flex flex-row gap-2 mr-2">
                        <img className='h-[40px]' src={Reduce}></img>
                        <img className='h-[40px]' src={Full}></img>
                        <img className='h-[40px]' src={Cross}></img>
                    </div>
                </div>

                <div className="gap-1 h-80 bg-[#EEE6E0] border-3 border-[#6d6d6d] flex flex-col border-t-0 justify-center md:gap-[5px]">

                    <h1 className="text-[23px] md:text-[37px] p-5">To join a lobby, click on the invitation link or enter the lobby Id here :</h1>
                       <form onSubmit={handleSubmit} className="flex justify-center items-center flex-col text-center gap-4">
                        <input type="text" name="link" className='text-[35px] border-3 border-[#6d6d6d] bg-white text-[#6d6d6d]'
                                value={formData.link}
                                onChange={handleChange}
                                required placeholder='Ex:E3DJ36'/>
                        <button className='bouton text-[20px] md:text-[32px] w-[190px]' type='submit'>Continue</button>
                       </form>
                </div>
            </div>
        </div>
        <div className='absolute bottom-0 w-[100%]'>
            <Footer />
        </div>
        </>
        )
};

export default Join