export default interface Message {
    type: string;
    lobby: string;
    pseudo: string;
    text: unknown;
}