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
import Eraser from "../../assets/image/artifact/Eraser.png";
import Dictator from "../../assets/image/artifact/Dictator.png";


import {useEffect, useState, useRef} from "react";
import InventoryWindow from "./InventoryWindow";
import { Artifact } from "../../interfaces/Artifact";
import baseInventory from "./Inventory.tsx";

// Different findable artifacts
const positiveArtifacts: Partial<Artifact>[] = [
    { id: 1, name: "GPS", icon: GPS, effect: 1, count: -1 },
    { id: 2, name: "Rollback", icon: Rollback, effect: 2, count: 1 },
    { id: 3, name: "Teleport", icon: Teleport, effect: 3, count: -1 },
    { id: 4, name: "Mine", icon: Mine, effect: 4, count: 1 },
];

const negativeArtifacts: Partial<Artifact>[] = [
    { id: 101, name: "Eraser", icon: Eraser, effect: -1, count: -1 },
    { id: 102, name: "Snail", icon: Snail, effect: -2, count: -1 },
    { id: 103, name: "Disorientor", icon: Disorientor, effect: -3, count: -1 },
    { id: 104, name: "Dictator", icon: Dictator, effect: -4, count: -1 }
];

// TODO : Replace with actual popularity scores (static)
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

const estimatePopularity = (title: string): number => {
    // Check if we already stored the article's popularity.
    if (popularityScores[title]) {
        return popularityScores[title];
    }

    // Current random estimation based on title length (must change)
    const baseScore = Math.max(0.1, Math.min(0.8, 1 - (title.length / 30)));

    // Keywords for most-likely famous articles (must change too)
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

    // Snail artifact
    const [isSnailActive, setIsSnailActive] = useState(false);
    const [snailTimer, setSnailTimer] = useState(0);
    const [showSnailPopup, setShowSnailPopup] = useState(false);
    const [snailIntervalId, setSnailIntervalId] = useState<NodeJS.Timeout | null>(null);

    // Disorientor artifact
    const [currentWikiUrl, setCurrentWikiUrl] = useState(props.wikiContent);
    const [showDisorientorPopup, setShowDisorientorPopup] = useState(false);
    const [disorientorDestination, setDisorientorDestination] = useState("");

    const startSnailTimer = () => {
        // Stop every existing timer
        if (snailIntervalId) {
            clearInterval(snailIntervalId);
        }

        // Start new timer
        const intervalId = setInterval(() => {
            setSnailTimer(prevTime => {
                const newTime = prevTime - 1;
                if (newTime <= 0) {
                    clearInterval(intervalId);
                    setIsSnailActive(false);
                    setShowSnailPopup(false);
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        setSnailIntervalId(intervalId);
    };

    useEffect(() => {
        return () => {
            if (snailIntervalId) {
                clearInterval(snailIntervalId);
            }
        };
    }, [snailIntervalId]);

    const checkForArtifact = (title: string) => {
        // Prevents artifact farming
        if (visitedPages.has(title)) {
            return;
        }
        setVisitedPages(prev => new Set(prev).add(title));
        const baseChance = 0.20;
        const popularity = estimatePopularity(title);

        // Checks if an artifact should appear
        const random = Math.random();
        if (random <= baseChance) {
            const isPositive = Math.random() <= popularity;

            // Select a random artifact
            const artifactPool = isPositive ? positiveArtifacts : negativeArtifacts;
            const selectedArtifact = artifactPool[Math.floor(Math.random() * artifactPool.length)];

            // Create artifact
            const foundArtifact: Artifact = {
                id: selectedArtifact.id!,
                name: selectedArtifact.name!,
                icon: selectedArtifact.icon!,
                effect: selectedArtifact.effect!,
                count: selectedArtifact.count!
            };

            // Checks if artifact is of instant use or not
            if (foundArtifact.count === -1) {
                setArtifactFound(foundArtifact);
                activateInstantArtifact(foundArtifact);
            } else {
                setArtifactFound(foundArtifact);
                setShowArtifactPopup(true);
            }
        }
    };

    const activateInstantArtifact = async (artifact: Artifact) => {
        switch (artifact.name) {
            case "Snail":
                // Can't do anything for 60 seconds
                setIsSnailActive(true);
                setSnailTimer(60);
                setShowSnailPopup(true);
                startSnailTimer();
                break;
            case "Disorientor":
                try {
                    const response = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
                    const data = await response.json();
                    const randomUrl = "https://en.wikipedia.org/wiki/" + encodeURIComponent(data.title);

                    // Store random destination to show in pop-up
                    setDisorientorDestination(data.title);
                    setShowDisorientorPopup(true);
                    // Send the player to a random URL
                    props.setPage(data.title);
                    setPageTitle(data.title);
                    // Updates URL for the WikipediaFrame
                    if (typeof setCurrentWikiUrl === 'function') {
                        setCurrentWikiUrl(randomUrl);
                    } else {
                        props.setPage(data.title);
                    }

                    // Pop-up automatically closes after 5 seconds.
                    setTimeout(() => {
                        setShowDisorientorPopup(false);
                    }, 5000);
                } catch (error) {
                    console.error("Error during the fetch of the articles:", error);
                }
                break;
        }

        setArtifactFound(null);
    };

    const handlePageChange = (newTitle: string) => {
        setPageTitle(newTitle);
        props.setPage(newTitle);
        checkForArtifact(newTitle);
    };

    const handleInventoryClick = () => {
        setInventoryOpen(!inventoryOpen);
    };

    const collectArtifact = () => {
        if (artifactFound) {
            let x = false;
            for (let i = 0; i < baseInventory.length; i++) {
                if (baseInventory[i].name === artifactFound.name) {
                    baseInventory[i].count++
                    x = true;
                    break;
                }
            }
            if (!x) {
                baseInventory.push(artifactFound);
            }
        }
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
                    <div className={`app-container ${isSnailActive ? 'snail-active' : ''}`}>

                    </div>
                    {showSnailPopup && (
                        <div className="artifact-popup">
                            <div className="artifact-popup-container">
                                <div className="artifact-popup-top">
                                    <div className="icons-container">
                                        <img className="icon" src={Reduce} alt="Reduce" />
                                        <img className="icon" src={Full} alt="Full Screen" />
                                        <img className="icon" src={Cross} alt="Close" />
                                    </div>
                                </div>
                                <div className="artifact-popup-content">
                                    <div className="artifact-popup-header">
                                        <h1 className="artifact-popup-title">You got snailed !</h1>
                                    </div>
                                    <div className="artifact-popup-body">
                                        <img
                                            src={Snail}
                                            alt="Snail"
                                            className="artifact-icon"
                                        />
                                        <div className="artifact-details">
                                            <div className="artifact-name">Snelly the Snail</div>
                                            <div className="artifact-effect">
                                                You are slowed down ! Impossible to do anything for
                                            </div>
                                            <div className="snail-timer">
                                                <span className="timer-value">{snailTimer}</span> seconds
                                            </div>
                                        </div>
                                        <div className="snail-message">
                                            Wait until the countdown ends...
                                        </div>
                                    </div>
                                    <div className="artifact-popup-bottom"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showDisorientorPopup && (
                        <div className="artifact-popup">
                            <div className="artifact-popup-container">
                                <div className="artifact-popup-top">
                                    <div className="icons-container">
                                        <img className="icon" src={Reduce} alt="Reduce" />
                                        <img className="icon" src={Full} alt="Full Screen" />
                                        <img className="icon" src={Cross} alt="Close" />
                                    </div>
                                </div>
                                <div className="artifact-popup-content">
                                    <div className="artifact-popup-header">
                                        <h1 className="artifact-popup-title">You got disoriented!</h1>
                                    </div>
                                    <div className="artifact-popup-body">
                                        <img
                                            src={Disorientor}
                                            alt="Disorientor"
                                            className="artifact-icon"
                                        />
                                        <div className="artifact-details">
                                            <div className="artifact-name">The Disorientor</div>
                                            <div className="artifact-effect">
                                                You have been teleported to a random page!
                                            </div>
                                            <div className="disorientor-destination">
                                                <span>Destination:</span> {disorientorDestination}
                                            </div>
                                        </div>
                                        <div className="disorientor-message">
                                            Find your way back to the target pages...
                                        </div>
                                    </div>
                                    <div className="artifact-popup-bottom"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {inventoryOpen && (
                        <div className="Inventory">
                            <InventoryWindow inventory={props.inventory}/>
                        </div>
                    )}
                    <section id="wiki-wikipage" className="wiki-wikipage-container">
                        <WikipediaFrame
                            src={currentWikiUrl || props.wikiContent}
                            className="wiki-frame"
                            onPageChange={handlePageChange}
                        />
                    </section>
                    <div className="wiki-bottom-spacer"></div>
                </div>
            </div>
            {showArtifactPopup && artifactFound && (
                <div className="artifact-popup">
                    <div className="artifact-popup-container">
                        <div className="artifact-popup-top">
                            <div className="icons-container">
                                <img className="icon" src={Reduce} alt="Reduce" />
                                <img className="icon" src={Full} alt="Full Screen" />
                                <img className="icon" src={Cross} alt="Close"/>
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