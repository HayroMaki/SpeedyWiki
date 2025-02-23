import "../stylesheets/wikiContentWindow.css"

import Reduce from "../assets/Icon/Reduce_Icon.png";
import Full from "../assets/Icon/FullScreen_Icon.png";
import Cross from "../assets/Icon/Cross_Icon.png";

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
                        <iframe src={props.wikiContent} className="wiki-frame" sandbox="allow-same-origin"></iframe>
                    </section>
                    <div className="wiki-bottom-spacer"></div>
                </div>
            </div>
        </>
    )
}
export default WikiContentWindow;