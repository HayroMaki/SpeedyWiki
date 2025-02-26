import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';
const About = () => {
    return(
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
                    
                    </div>

                </div>
            </div>
    );
}

export default About