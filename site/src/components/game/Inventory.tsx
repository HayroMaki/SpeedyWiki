import { Artifact } from "../../interfaces/Artifact";
import TEMP from "../../assets/image/artifact/TEMP.png";

export const baseInventory: Artifact[] = [
    {
        id:0,
        name: "test1",
        icon: TEMP,
        effect: 0,
        count: 5,
    },{
        id:1,
        name: "test2",
        icon: TEMP,
        effect: 1,
        count: 0,
    },{
        id:2,
        name: "test3",
        icon: TEMP,
        effect: 2,
        count: 0,
    }
];

export default baseInventory;