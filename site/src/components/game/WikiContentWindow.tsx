import "../../stylesheets/game/wikiContentWindow.css"

import Reduce from "../../assets/icon/Reduce_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Cross from "../../assets/icon/Cross_Icon.png";

// Artifact icons
import GPS from "../../assets/image/artifact/GPS.png";
import Rollback from "../../assets/image/artifact/Rollback.png";
import Teleport from "../../assets/image/artifact/Teleport.png";
import Mine from "../../assets/image/artifact/Mine.png";
import Snail from "../../assets/image/artifact/Snail.png";
import Disorientor from "../../assets/image/artifact/Disorientor.png";
import Dictator from "../../assets/image/artifact/Dictator.png";


import {useEffect, useState, useRef} from "react";
import InventoryWindow from "./InventoryWindow";
import { Artifact } from "../../interfaces/Artifact";
import baseInventory from "./Inventory.tsx";

// Définition des artéfacts disponibles dans le jeu
const positiveArtifacts: Partial<Artifact>[] = [
    { id: 1, name: "GPS", icon: GPS, effect: 1, count: 1 },
    { id: 2, name: "Rollback", icon: Rollback, effect: 2, count: 1 },
    { id: 3, name: "Teleport", icon: Teleport, effect: 3, count: 1 }
    //{ id: 4, name: "Portal", icon: "portal_icon.png", effect: 4, count: 1 },
];

const negativeArtifacts: Partial<Artifact>[] = [
    { id: 101, name: "Mine", icon: Mine, effect: -1, count: 1 },
    { id: 102, name: "Snail", icon: Snail, effect: -2, count: 1 },
    { id: 103, name: "Disorientor", icon: Disorientor, effect: -3, count: 1 },
    { id: 104, name: "Dictator", icon: Dictator, effect: -4, count: 1 },
];

// Valeurs de popularité pour simuler (à remplacer par des données réelles)
const popularityScores: Record<string, number> = {
    "World War II": 0.9,
    "United States": 0.85,
    "France": 0.8,
    "Albert Einstein": 0.75,
    "COVID-19 pandemic": 0.7,
    "Football": 0.65,
    "Mathematics": 0.6,
    "Computer science": 0.55,
    "Philosophy": 0.5,
    "Quantum mechanics": 0.45,
    "Mongolia": 0.4,
    "Inca Empire": 0.35,
    "Paleontology": 0.3,
    "Harpsichord": 0.25,
    "Carnivorous plants": 0.2,
    "Obscure topic": 0.1,
};

// Fonction pour estimer la popularité d'un titre d'article
const estimatePopularity = (title: string): number => {
    // Vérifier si on a une valeur directe pour ce titre
    if (popularityScores[title]) {
        return popularityScores[title];
    }

    // Sinon, faire une estimation simple basée sur la longueur du titre
    // (Plus le titre est court, plus l'article est probablement populaire)
    const baseScore = Math.max(0.1, Math.min(0.8, 1 - (title.length / 30)));

    // Mots qui suggèrent des sujets populaires
    const popularKeywords = ['history', 'war', 'country', 'famous', 'science', 'movie', 'music', 'sport'];
    const containsPopularKeyword = popularKeywords.some(keyword =>
        title.toLowerCase().includes(keyword.toLowerCase())
    );

    return containsPopularKeyword ? baseScore + 0.2 : baseScore;
};

const WikipediaFrame = (props: { src: string; className: string; onPageChange: (title: string) => void }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const host = window.location.hostname;
    const proxyUrl = `http://`+host+`:3001/proxy?url=${encodeURIComponent(props.src)}`;

    useEffect(() => {
        const handlePageTitleChange = (event: MessageEvent) => {
            if (event.origin === "http://"+host+":3001") { // Verify origin for security (WILL BE MODIFIED LATER)
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

export const WikiContentWindow = (props: {
    wikiContent: string,
    title: string,
    setPage: (page: string) => void;
    inventory: Artifact[],
}) => {
    const [pageTitle, setPageTitle] = useState(props.title);
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [artifactFound, setArtifactFound] = useState<Artifact | null>(null);
    const [showArtifactPopup, setShowArtifactPopup] = useState(false);
    const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set([props.title]));

    // Fonction pour déterminer si un artéfact apparaît
    const checkForArtifact = (title: string) => {
        // Ne pas générer d'artéfact si on a déjà visité cette page
        if (visitedPages.has(title)) {
            return;
        }

        // Ajouter la page à l'historique des pages visitées
        setVisitedPages(prev => new Set(prev).add(title));

        // Probabilité de base pour trouver un artéfact (20%)
        const baseChance = 0.20;

        // Obtenir la popularité estimée de l'article (0-1)
        const popularity = estimatePopularity(title);

        // Calculer si un artéfact apparaît
        const random = Math.random();
        if (random <= baseChance) {
            // Un artéfact est trouvé!

            // La probabilité d'obtenir un artéfact positif dépend de la popularité
            const isPositive = Math.random() <= popularity;

            // Sélectionner un artéfact aléatoire
            const artifactPool = isPositive ? positiveArtifacts : negativeArtifacts;
            const selectedArtifact = artifactPool[Math.floor(Math.random() * artifactPool.length)];

            // Créer l'instance complète de l'artéfact
            const foundArtifact: Artifact = {
                id: selectedArtifact.id!,
                name: selectedArtifact.name!,
                icon: selectedArtifact.icon!,
                effect: selectedArtifact.effect!,
                count: selectedArtifact.count!
            };

            // Afficher l'artéfact trouvé
            setArtifactFound(foundArtifact);
            setShowArtifactPopup(true);
        }
    };

    const handlePageChange = (newTitle: string) => {
        setPageTitle(newTitle);
        props.setPage(newTitle);

        // Vérifier si un artéfact apparaît sur cette nouvelle page
        checkForArtifact(newTitle);
    };

    const handleInventoryClick = () => {
        setInventoryOpen(!inventoryOpen);
    };

    const collectArtifact = () => {
        if (artifactFound) {
            let x = false;
            for(let i = 0; i < baseInventory.length; i++) {
                if(baseInventory[i].name === artifactFound.name) {
                    baseInventory[i].count++
                    x = true;
                    break;
                }
            }
            if(!x) {
                baseInventory.push(artifactFound);
            }
        }
        setShowArtifactPopup(false);
        setArtifactFound(null);
    };

    const closeArtifactPopup = () => {
        setShowArtifactPopup(false);
        setArtifactFound(null);
    };

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
                    {inventoryOpen && (
                        <div className="Inventory">
                            <InventoryWindow inventory={props.inventory}/>
                        </div>
                    )}
                    <section id="wiki-wikipage" className="wiki-wikipage-container">
                        <WikipediaFrame
                            src={props.wikiContent}
                            className="wiki-frame"
                            onPageChange={handlePageChange}
                        />
                    </section>
                    <div className="wiki-bottom-spacer"></div>
                </div>
            </div>

            {/* Popup pour l'artéfact trouvé - Style Windows 98 */}
            {showArtifactPopup && artifactFound && (
                <div className="artifact-popup">
                    <div className="artifact-popup-container">
                        <div className="artifact-popup-top">
                            <div className="icons-container">
                                <img className="icon" src={Reduce} alt="Reduce" />
                                <img className="icon" src={Full} alt="Full Screen" />
                                <img className="icon" src={Cross} alt="Close" onClick={closeArtifactPopup} />
                            </div>
                        </div>
                        <div className="artifact-popup-content">
                            <div className="artifact-popup-header">
                                <h1 className="artifact-popup-title">Artifact found!</h1>
                            </div>
                            <div className="artifact-popup-body">
                                <img
                                    src={artifactFound.icon}
                                    alt="Artifact"
                                    className="artifact-icon"
                                />
                                <div className="artifact-details">
                                    <div className="artifact-name">{artifactFound.name}</div>
                                    <div className="artifact-effect">
                                        {artifactFound.effect > 0
                                            ? "This is a positive artifact that will help you in your journey!"
                                            : "This is a negative artifact that will make your quest more challenging!"}
                                    </div>
                                </div>
                                <button onClick={collectArtifact} className="collect-button">
                                    Collect
                                </button>
                            </div>
                            <div className="artifact-popup-bottom"></div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WikiContentWindow;