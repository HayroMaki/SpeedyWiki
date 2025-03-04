import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";
import image1 from "../../assets/image/Char2.png";
import '../../stylesheets/win/Podium.css'
const Podium = () => {
    return(
        <>
        <div className="Podium-container">
            <div className="Top1-window">
                <div className="Podium-top">
                        <div className="icons-container">
                            <img className='icon' src={Reduce}></img>
                            <img className='icon' src={Full}></img>
                            <img className='icon' src={Cross}></img>
                        </div>
                </div>  
                <div className="Podium-content">
                    First place:
                    <h1>Name</h1>
                    <img src={image1} className="First-Place"/>
                    <h1>X moves</h1>
                </div>

            </div>

            <div className="Others">

                <div className="Top2-3-window">
                <div className="Podium-top">
                        <div className="icons-container">
                            <img className='icon' src={Reduce}></img>
                            <img className='icon' src={Full}></img>
                            <img className='icon' src={Cross}></img>
                        </div>
                </div>  
                <div className="Podium-content">
                    Second place:
                    <h1>Name</h1>
                    <img src={image1} className="Other-podium"/>
                    <h1>X moves</h1>
                </div>
                </div>

                <div className="Top2-3-window">
                <div className="Podium-top">
                        <div className="icons-container">
                            <img className='icon' src={Reduce}></img>
                            <img className='icon' src={Full}></img>
                            <img className='icon' src={Cross}></img>
                        </div>
                </div>  
                <div className="Podium-content">
                    Third place:
                    <h1>Name</h1>
                    <img src={image1} className="Other-podium"/>
                    <h1>X moves</h1>
                </div>
                </div>

            </div>
        </div>
        </>
    )
}

export default Podium