import Cross from '../assets/Icon/Cross_Icon.png';
import Full from '../assets/Icon/FullScreen_Icon.png';
import Reduce from '../assets/Icon/Reduce_Icon.png';
import Footer from '../components/Footer';
import { NavLink} from "react-router-dom";
const Homepage = () => {
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

                <div className="gap-8 h-80 bg-[#EEE6E0] border-3 border-[#6d6d6d] flex flex-col border-t-0 justify-center md:gap-24">

                    <h1 className="text-[32px] md:text-[48px] p-5">Create or Join an online lobby !</h1>
                    <div className="gap-4 item-end flex flex-row flex-wrap justify-center md:gap-60">
                        <NavLink to="/Create" className="bouton text-[32px] md:text-[48px] w-[240px]">Create !</NavLink>
                        <NavLink to="/Join" className="bouton text-[32px] md:text-[48px] w-[240px]">Join !</NavLink>
                    </div>

                </div>
            </div>
        </div>
        <div className='absolute bottom-0 w-[100%]'>
            <Footer />
        </div>
        </>
        )
};

export default Homepage;

