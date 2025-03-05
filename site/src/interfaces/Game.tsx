import {User} from "./User";
import {Article} from "./Article";
import {Chat} from "./Chat";

export interface Game {
    id: number;
    link: string;
    articles: Article[];
    host: number;
    players: User[];
    time: number;
    chat: Chat[];
}