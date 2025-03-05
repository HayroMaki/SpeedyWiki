import "../../stylesheets/game/wikiContentWindow.css"

import Reduce from "../../assets/icon/Reduce_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Cross from "../../assets/icon/Cross_Icon.png";

import {useEffect ,useState, useRef} from "react";

const WikipediaFrame = (props: { src: string; className: string; onPageChange: (title: string) => void }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const proxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(props.src)}`;

    useEffect(() => {
        const handlePageTitleChange = (event: MessageEvent) => {
            if (event.origin === "http://localhost:3001") { // Verify origin for security (WILL BE MODIFIED LATER)
                props.onPageChange(event.data);
            }
        };

        window.addEventListener("message", handlePageTitleChange);

        return () => {
            window.removeEventListener("message", handlePageTitleChange);
        };
    }, [props]);

    return (
        <iframe
            ref={iframeRef}
            src={proxyUrl}
            className={props.className}
        />
    );
};

export const WikiContentWindow = (props: { wikiContent: string, title: string, setPage: (page: string) => void }) => {
    const [pageTitle, setPageTitle] = useState(props.title);
    const [inventoryOpen, setInventoryOpen] = useState(false);
    
    const handlePageChange = (newTitle: string) => {
        setPageTitle(newTitle);
        props.setPage(newTitle);
    };

    const handleInventoryClick = () => {
        setInventoryOpen(!inventoryOpen);
        console.log("inventory open : " + inventoryOpen);
    }

    return (
        <>
            <div className="wiki-container">
                <div className="wiki-top">
                    <div className="icons-container">
                        <img className="icon" src={Reduce} alt="Reduce" />
                        <img className="icon" src={Full} alt="Full Screen" />
                        <img className="icon" src={Cross} alt="Close" />
                    </div>
                </div>
                <div className="wiki-content">
                    <div className="wiki-content-top">
                        <h1 className="wiki-title">Page : {pageTitle}</h1>
                        <button className="wiki-button button" onClick={handleInventoryClick}>Inventory</button>
                    </div>
                    <section id="wiki-wikipage" className="wiki-wikipage-container">
                        <WikipediaFrame
                            src={props.wikiContent}
                            className="wiki-frame"
                            onPageChange={handlePageChange}  // Title update function
                        />
                    </section>
                    <div className="wiki-bottom-spacer"></div>
                </div>
            </div>
        </>
    );
};

export default WikiContentWindow;
