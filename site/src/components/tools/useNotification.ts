import {JSX, useState} from "react";

export function useNotification(): {
    visible: boolean;
    text: JSX.Element | undefined;
    showNotification: (text: JSX.Element, ms: number) => void
} {
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState<JSX.Element>();

    const showNotification = (text: JSX.Element, ms: number): void => {
        setVisible(true);
        setText(text);
        setTimeout(() => {
            setVisible(false);
        }, ms);
    };

    return {
        visible,
        text,
        showNotification
    };
}
export default useNotification;