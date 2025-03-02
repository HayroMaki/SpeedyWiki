import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";
import '../../stylesheets/win/Stat.css'
const Stat = () => {
return(
    <>
    <div className="Stat-container">
                <div className="Stat-list-top">
                    <div className="icons-container">
                        <img className='icon' src={Reduce}></img>
                        <img className='icon' src={Full}></img>
                        <img className='icon' src={Cross}></img>
                    </div>
                </div>  

                <div className="Stat-content">
                    <h1 className="Stat-title">Your stats :</h1>
                    <div className="Stat-list-container">
                    <h1>Move : </h1>
                    <h1>Time : </h1>
                    <h1>Pages found :</h1>
                    <div className="Stat-list-articles">
                        
                    </div>
                    <h1>Items used : </h1>
                    </div>
                </div>
    </div>
    </>
)
}

export default Stat