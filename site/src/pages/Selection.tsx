import React, { useState } from 'react';

import "../stylesheets/home/footerWindow.css";
import "../stylesheets/Selection.css"

import Footer from '../components/home/FooterWindow.tsx';
import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';
import PicSelect from '../components/home/Pic_selec.tsx';


interface Name {
    name : string;
}

const Selection: React.FC = () => {
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
            <div className="selection">
                <h1 className="title">SpeedyWiki</h1>
                <br />
                <div className="selection-container">
                    <div className="selection-top">
                        <div className="icons-container">
                            <img className='icon' src={Reduce}></img>
                            <img className='icon' src={Full}></img>
                            <img className='icon' src={Cross}></img>
                        </div>
                    </div>
                    <div className="selection-content">
                        <h1>Choose a character :</h1>
                        <div className='pic-selection'>
                            <PicSelect/>
                        </div>
                        <h1>And a name :</h1>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required placeholder='Ex: Xx_CoolAssName_xX'/>
                            <button className='selection-button button' type='submit'>Join !</button>
                       </form>
                    </div>
                </div>
                <Footer/>
            </div>
        </>
        )
};

export default Selection;