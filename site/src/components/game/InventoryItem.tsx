import {Artifact} from "../../interfaces/Artifact"
import {Notification} from "../tools/Notification.tsx";
import {useNotification} from "../tools/useNotification.tsx";

export const InventoryItem = (props:{artifact:Artifact}) => {
    const {visible, showNotification, text} = useNotification()

    if (props.artifact.count > 0) {
        return (
            <>
                <div key={props.artifact.id} className="inventory-item" 
                    onClick={() => {
                        showNotification(<div>Used {props.artifact.name} !</div>, 2000);
                        props.artifact.count--;
                    }}>
                    <img src={props.artifact.icon} alt="Art."></img>
                    <p>{props.artifact.count}</p>
                </div>
                <Notification visible={visible} text={text}/>
            </>
        )
    }
}
export default InventoryItem;