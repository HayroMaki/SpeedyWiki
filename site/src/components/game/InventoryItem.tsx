import {Artifact} from "../../interfaces/Artifact"
import {Notification} from "../tools/Notification.tsx";
import {useNotification} from "../tools/useNotification.tsx";

export const InventoryItem = (props:{
    artifact: Artifact,
    onUse: (artifact: Artifact) => void
}) => {
    const {visible, showNotification, text} = useNotification();

    const handleItemUse = () => {
        if (props.artifact.count > 0) {
            showNotification(<div>Used {props.artifact.name}!</div>, 2000);
            props.onUse(props.artifact);
        }
    };

    if (props.artifact.count > 0) {
        return (
            <>
                <div key={props.artifact.id} className="inventory-item" onClick={handleItemUse}>
                    <img src={props.artifact.icon} alt="Art."></img>
                    <p>{props.artifact.count}</p>
                </div>
                <Notification visible={visible} text={text}/>
            </>
        )
    }
}
export default InventoryItem;