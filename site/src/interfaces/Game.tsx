import {User} from "./User";
import {Article} from "./Article";

export interface Game {
    id: number;
    link: string;
    articles: Article[];
    host: number;
    players: User[];
    time: number;
}