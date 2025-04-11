import "../../stylesheets/game/inventoryWindow.css"

import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";

import {Artifact} from "../../interfaces/Artifact";
import InventoryItem from "./InventoryItem.tsx";

export const InventoryWindow = (props: {
    inventory: Artifact[],
    onUseArtifact: (artifact: Artifact) => void
}) => {
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
                    <div className="inventory-spacer"></div>
                    <div className="inventory-box">
                        {props.inventory.map((artifact) => {
                            return (<InventoryItem
                                key={artifact.id}
                                artifact={artifact}
                                onUse={props.onUseArtifact}
                            />)
                        })}
                    </div>
                    <div className="inventory-spacer"></div>
                </div>
            </div>
        </>
    )
}
export default InventoryWindow;