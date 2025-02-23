import "../stylesheets/wikiContentWindow.css"

import Reduce from "../assets/Icon/Reduce_Icon.png";
import Full from "../assets/Icon/FullScreen_Icon.png";
import Cross from "../assets/Icon/Cross_Icon.png";

const WikipediaFrame = (props: { src: string; className: string }) => {
    const proxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(props.src)}`;

    return (
        <iframe
            src={proxyUrl}
            className={props.className}
            width="800"
            height="600"
        />
    );
};

export const WikiContentWindow = (props : {wikiContent : string}) => {
    return (
        <>
            <div className="wiki-container">
                <div className="wiki-top">
                    <div className="icons-container">
                        <img className="icon" src={Reduce}/>
                        <img className="icon" src={Full}/>
                        <img className="icon" src={Cross}/>
                    </div>
                </div>
                <div className="wiki-content">
                    <div className="wiki-spacer"></div>
                    <section id="wiki-wikipage" className="wiki-wikipage-container">
                        <WikipediaFrame src={props.wikiContent} className="wiki-frame"></WikipediaFrame>
                    </section>
                    <div className="wiki-bottom-spacer"></div>
                </div>
            </div>
        </>
    )
}
export default WikiContentWindow;