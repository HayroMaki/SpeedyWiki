import { useState } from 'react';
import Cross from '../assets/Icon/Cross_Icon.png';
import Full from '../assets/Icon/FullScreen_Icon.png';
import Reduce from '../assets/Icon/Reduce_Icon.png';
import PicSelect from '../components/Pic_selec';


interface Name {
    name : string;
}

const NameSelection: React.FC = () => {
    const [formData, setFormData] = useState<Name>({ name: "" });
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ name: e.target.value });
    };
  
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log("Lien soumis:", formData.name);
    };
    return ( 
        <>
        <div className="flex flex-col items-center text-center overflow-hidden">
            <div className="w-120 md:w-220">

                <div className="h-[50px] bg-[#A2D2F6] border-3 border-[#6d6d6d] flex justify-end items-center mt-8">
                    <div className="flex flex-row gap-2 mr-2">
                        <img className='h-[40px]' src={Reduce}></img>
                        <img className='h-[40px]' src={Full}></img>
                        <img className='h-[40px]' src={Cross}></img>
                    </div>
                </div>

                <div className="gap-3 h-160 bg-[#EEE6E0] border-3 border-[#6d6d6d] flex flex-col border-t-0 justify-center md:gap-4">

                    <h1 className="text-[35px] md:text-[40px] p-5">Choose a character :</h1>
                    <div className='flex items-center justify-center'>
                        <PicSelect/>
                    </div>
                    <h1 className="text-[35px] md:text-[40px] p-5">And a name :</h1>
                    <form onSubmit={handleSubmit} className="flex justify-center items-center flex-col text-center gap-4">
                        <input type="text" name="name" className='text-[35px] border-3 border-[#6d6d6d] bg-white text-[#6d6d6d]'
                                value={formData.name}
                                onChange={handleChange}
                                required placeholder='Ex: Xx_CoolAssName_xX'/>
                        <button className='bouton text-[30px] md:text-[32px] w-[190px]' type='submit'>Join !</button>
                       </form>

                </div>
            </div>
        </div>
        
        </>
        )
};

export default NameSelection;