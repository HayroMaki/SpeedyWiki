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
    const [randomItem, setRandomItem] = useState(PP[Math.floor(Math.random() * PP.length)]);

    const generateRandomItem = () => {
      const randimage = PP[Math.floor(Math.random() * PP.length)]
      if (randimage==randomItem){
        generateRandomItem();
      } else {
        setRandomItem(PP[Math.floor(Math.random() * PP.length)]);
      }
    };
    return(
        <><div className="flex flex-col items-center">
        <div className="flex flex-col items-center relative">
          {/* Image */}
          <img className="h-[210px] w-[210px]" src={randomItem} alt="random" />
    
          {/* Bouton aligné en bas à droite sans absolute */}
          <div className="flex justify-end w-full mt-[-40px] pr-2">
            <button className="h-[50px] w-[50px] z-10" onClick={generateRandomItem}>
              <img src={Randicon} alt="random icon" />
            </button>
          </div>
        </div>
      </div>
        </>
    );
};

export default PicSelect;