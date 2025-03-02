import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";
import '../../stylesheets/win/ListLooser.css'
const ListLooser = () => {
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
                    
                    </div>
                </div>
    </div>
    </>
    )
}

export default ListLooser