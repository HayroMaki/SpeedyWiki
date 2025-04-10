import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";
import '../../stylesheets/win/ListLooser.css'
import PP1 from '../../assets/image/char/Char1.png';
import PP2 from '../../assets/image/char/Char2.png';
import PP3 from '../../assets/image/char/Char3.png';
import PP4 from '../../assets/image/char/Char4.png';
import PP5 from '../../assets/image/char/Char5.png';
import PP6 from '../../assets/image/char/Char6.png';
import PP7 from '../../assets/image/char/Char7.png';
import PP8 from '../../assets/image/char/Char8.png';
import PP9 from '../../assets/image/char/Char9.png';

const PP:string[] = [PP1,PP2,PP3,PP4,PP5,PP6,PP7,PP8,PP9];
const pictureColorMap: { [key: number]: string } = {
    1: "#1F3A62",   // Bleu foncé
    2: "#BB124C",   // Rouge framboise
    3: "#1149C2",   // Bleu roi
    4: "#FFFF11",   // Jaune vif
    5: "#992817",   // Rouge brique
    6: "#111111",   // Noir
    7: "#AAAABA",   // Gris bleuté
    8: "#3DBF86",   // Vert menthe
    9: "#F28C28",   // Orange doux
};

const ListLooser = ({ loosers }: { loosers: { pseudo: string,image:number, clicks: string }[] }) => {
    return(
        <>
    <div className="Looser-container">
                <div className="Looser-top">
                    <div className="icons-container">
                        <img className='icon' src={Reduce}></img>
                        <img className='icon' src={Full}></img>
                        <img className='icon' src={Cross}></img>
                    </div>
                </div>  

                <div className="Looser-content">
                    <h1 className="Looser-title">Loosers :</h1>
                    <div className="Looser-list-container">
                    {loosers.map((looser, index) => (
                            <div key={index} className="Looser-item">
                                <h2 style={{ color: pictureColorMap[looser.image] }}>{looser.pseudo}</h2>
                                <img
                                    src={PP[looser.image- 0]}
                                    alt={looser.pseudo}
                                    className="Looser-image"
                                />
                                <p>{looser.clicks} moves</p>
                    </div>
                    ))}
                </div>
        </div>
    </div>
    </>
    )
}

export default ListLooser