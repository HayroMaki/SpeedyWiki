import { useState } from 'react';
import "../stylesheets/footerWindow.css";
import "../stylesheets/nameSelection.css"

import Footer from '../components/FooterWindow';
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
       <div className="name_selection-container">
                <div className="name_selection-size">
                    <div className="name_selection-top">
                        <div className="name_icons-container">
                            <img className='icon' src={Reduce}></img>
                            <img className='icon' src={Full}></img>
                            <img className='icon' src={Cross}></img>
                        </div>
                    </div>
                    <div className="name_content">
                        <h1 className="">Choose a character :</h1>
                        <div className='pic_select'>
                            <PicSelect/>
                        </div>
                        <h1 className="">And a name :</h1>
                        <form onSubmit={handleSubmit} className="">
                            <input type="text" name="name" className=''
                                    value={formData.name}
                                    onChange={handleChange}
                                    required placeholder='Ex: Xx_CoolAssName_xX'/>
                            <button className='join_button' type='submit'>Join !</button>
                       </form>
                    </div>
                </div>
                <div className='Footer'>
                    <Footer/>
                </div>
            </div>
        
        </>
        )
};

export default NameSelection;