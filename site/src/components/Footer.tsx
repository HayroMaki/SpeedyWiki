import Cross from '../assets/Icon/Cross_Icon.png';
import Full from '../assets/Icon/FullScreen_Icon.png';
import Reduce from '../assets/Icon/Reduce_Icon.png';


const Footer = () => {
    return ( 
            <div className="w-[100%]">

                <div className="h-[50px] bg-[#A2D2F6] border-3 border-[#6d6d6d] flex items-center flex-row justify-between">
                    <div className='m-auto'>
                        <a className='bouton w-[240px] md:w-[350px] h-[40px] text-[30px] '>About us</a>
                    </div>
                    <div className="flex flex-row gap-2 mr-2 justify-end absolute right-0">
                        <img className='h-[40px]' src={Reduce}></img>
                        <img className='h-[40px]' src={Full}></img>
                        <img className='h-[40px]' src={Cross}></img>
                    </div>
                </div>

                <div className="h-25 bg-[#EEE6E0] border-3 border-[#6d6d6d] flex flex-col border-t-0 justify-center text-center ">
                            <a className='text-[30px]'>Copyright</a>
                </div>
            </div>
        )
};

export default Footer;

