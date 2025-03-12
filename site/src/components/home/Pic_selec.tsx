import "../../stylesheets/home/picSelectionComponent.css";

import { useWS } from '../../components/WSContext.tsx';
import useRunOnce from "../tools/useRunOnce";

import Randicon from '../../assets/icon/Random_Icon.png';

import PP1 from '../../assets/image/char/Char1.png';
import PP2 from '../../assets/image/char/Char2.png';
import PP3 from '../../assets/image/char/Char3.png';
import PP4 from '../../assets/image/char/Char4.png';
import PP5 from '../../assets/image/char/Char5.png';
import PP6 from '../../assets/image/char/Char6.png';
import PP7 from '../../assets/image/char/Char7.png';
import PP8 from '../../assets/image/char/Char8.png';
import PP9 from '../../assets/image/char/Char9.png';

const PicSelect = () => {
    const PP = [PP1,PP2,PP3,PP4,PP5,PP6,PP7,PP8,PP9];
    const {picture, setPicture} = useWS();

    const generateRandomItem = () => {
      const randomItem = Math.floor(Math.random() * PP.length);
      if (randomItem == picture){
        generateRandomItem();
      } else {
        setPicture(randomItem);
      }
    };

    useRunOnce({fn: () => {generateRandomItem();}})

    return(
        <>
            <div className="pic-select-container">
                <div className="pic-select-image-container">
                    <img className="pic-select-image" src={PP[picture]} alt="random" />
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