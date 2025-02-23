import "../stylesheets/wikiContentWindow.css"

import Reduce from "../assets/Icon/Reduce_Icon.png";
import Full from "../assets/Icon/FullScreen_Icon.png";
import Cross from "../assets/Icon/Cross_Icon.png";

import { useEffect, useRef } from "react";

const WikipediaFrame = ({ src, className }: { src: string; className: string }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleLoad = () => {
        const iframe = iframeRef.current;
        if (!iframe) return; // Vérifie que l'iframe existe

        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!doc) {
                console.warn("Impossible d'accéder au contenu de l'iframe.");
                return;
            }

            const links = doc.querySelectorAll("a");
            links.forEach(link => {
                const href = link.getAttribute("href");
                console.log(href); // Debug : Affiche tous les liens
                if (!href?.startsWith("/wiki/")) {
                    link.style.pointerEvents = "none"; // Désactive le clic
                    link.style.opacity = "0.5"; // Rend le lien visuellement désactivé
                }
            });
        } catch (error) {
            console.warn("Erreur lors de la modification de l'iframe", error);
        }
    };

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        iframe.addEventListener("load", handleLoad);
        return () => iframe.removeEventListener("load", handleLoad);
    }, []);

    return (
        <iframe
            ref={iframeRef}
            src={src}
            className={className}
            sandbox="allow-scripts" // ⚠️ Ne pas mettre "allow-same-origin" sinon Wikipedia bloque l'accès au DOM
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