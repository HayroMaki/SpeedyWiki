import "../stylesheets/inventoryWindow.css"

import Cross from "../assets/Icon/Cross_Icon.png";
import Full from "../assets/Icon/FullScreen_Icon.png";
import Reduce from "../assets/Icon/Reduce_Icon.png";

export const InventoryWindow = () => {
    return (
        <>
            <div className="inventory-container">
                <div className="inventory-top">
                    <div className="icons-container">
                        <img className="icon" src={Reduce}/>
                        <img className="icon" src={Full}/>
                        <img className="icon" src={Cross}/>
                    </div>
                </div>
                <div className="inventory-content">
                    <h1 className="inventory-title">Inventory :</h1>
                    <div className="inventory-box"></div>
                    <div className="inventory-bottom-spacer"></div>
                </div>
            </div>

        </>
    )
}
export default InventoryWindow;