import "../stylesheets/picSelectionComponent.css";

import { useState } from 'react';

import Randicon from '../assets/Image/Random Icon.png';
import PP1 from '../assets/Image/dvdguy 1.png';
import PP2 from '../assets/Image/New Piskel (2) 1.png';
import PP3 from '../assets/Image/New Piskel (2) 3.png';
import PP4 from '../assets/Image/New Piskel (3) 1.png';
import PP5 from '../assets/Image/New Piskel 2.png';
import PP6 from '../assets/Image/New Piskel 3.png';

const PicSelect = () => {
    const PP = [PP1,PP2,PP3,PP4,PP5,PP6];
    const [item, setItem] = useState(PP[Math.floor(Math.random() * PP.length)]);

    const generateRandomItem = () => {
      const randomItem = PP[Math.floor(Math.random() * PP.length)]
      if (randomItem == item){
        generateRandomItem();
      } else {
        setItem(randomItem);
      }
    };
    return(
        <>
            <div className="pic-select-container">
                <div className="pic-select-image-container">
                    <img className="pic-select-image" src={item} alt="random" />
                    <div className="pic-select-button-container">
                        <button className="pic-select-button" onClick={generateRandomItem}>
                            <img src={Randicon} alt="random icon" />
                        </button>
                    </div>
                </div>
            </div>

        </>
    );
};

export default PicSelect;