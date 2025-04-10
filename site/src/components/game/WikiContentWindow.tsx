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
import {useWS} from "../WSContext.tsx";
import {Article} from "../../interfaces/Article.tsx";

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
    articles?: Article[];
}) => {
    const {setActualPage} = useWS();

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

    // Teleporter artifact
    const [showTeleportPopup, setShowTeleportPopup] = useState(false);
    const [teleportDestination, setTeleportDestination] = useState("");
    // const [teleportNearTarget, setTeleportNearTarget] = useState("");

    const startSnailTimer = () => {
        // Stop every existing timer
        if (snailIntervalId) {
            clearInterval(snailIntervalId);
        }

        // Start new timer
        const intervalId = setInterval(() => {
            setSnailTimer(prevTime => {
                const newTime = prevTime - 1;
                localStorage.setItem("snail",JSON.stringify(prevTime));
                if (newTime <= 0) {
                    clearInterval(intervalId);
                    setIsSnailActive(false);
                    setShowSnailPopup(false);
                    localStorage.removeItem("snail");
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        setSnailIntervalId(intervalId);
    };


    const findUncompletedTargetArticle = (targetArticles: Article[]) => {
        const uncompletedArticles = targetArticles.filter(article => !article.completion);
        if (uncompletedArticles.length === 0) return null;
        return uncompletedArticles[Math.floor(Math.random() * uncompletedArticles.length)];
    };

    // Fonction améliorée pour obtenir une page à deux liens de distance d'un article cible
    const findTeleportDestination = async (targetArticles: Article[]) => {
        // Trouve un article cible non complété
        const targetArticle = findUncompletedTargetArticle(targetArticles);

        if (!targetArticle) {
            // Si tous les articles sont complétés, téléporter vers un article aléatoire
            try {
                const response = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
                const data = await response.json();
                return { destination: data.title, nearTarget: "Tous les objectifs sont complétés" };
            } catch (error) {
                console.error("Error fetching random article:", error);
                return null;
            }
        }

        try {
            // Utiliser l'API MediaWiki directement pour plus de flexibilité
            // Cette méthode récupère les liens à partir de l'article cible
            const firstLevelUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(targetArticle.title)}&prop=links&pllimit=500&format=json&origin=*`;
            const firstLevelResponse = await fetch(firstLevelUrl);
            const firstLevelData = await firstLevelResponse.json();

            // Extraire la page et ses liens
            const pages = firstLevelData.query.pages;
            const pageId = Object.keys(pages)[0];

            if (!pages[pageId].links || pages[pageId].links.length === 0) {
                throw new Error("No links found on target page");
            }

            // Filtrer pour ne garder que les articles principaux (pas de pages spéciales)
            const validLinks = pages[pageId].links.filter(link =>
                !link.title.includes("Wikipedia:") &&
                !link.title.includes("Template:") &&
                !link.title.includes("Help:") &&
                !link.title.includes("Category:") &&
                !link.title.includes("Talk:") &&
                !link.title.includes("File:")
            );

            if (validLinks.length === 0) {
                throw new Error("No valid links found");
            }

            // Choisir un lien aléatoire du premier niveau
            const randomFirstLink = validLinks[Math.floor(Math.random() * validLinks.length)].title;
            console.log("First level link:", randomFirstLink);

            // Maintenant, récupérer les liens du premier lien pour atteindre le deuxième niveau
            const secondLevelUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(randomFirstLink)}&prop=links&pllimit=500&format=json&origin=*`;
            const secondLevelResponse = await fetch(secondLevelUrl);
            const secondLevelData = await secondLevelResponse.json();

            // Extraire la page et ses liens
            const secondPages = secondLevelData.query.pages;
            const secondPageId = Object.keys(secondPages)[0];

            // Si la page existe mais n'a pas de liens ou est une page spéciale
            if (secondPageId === "-1" || !secondPages[secondPageId].links || secondPages[secondPageId].links.length === 0) {
                // Essayer un autre lien du premier niveau
                throw new Error("Second level page invalid or has no links");
            }

            // Filtrer pour ne garder que les articles principaux (pas de pages spéciales)
            const validSecondLinks = secondPages[secondPageId].links.filter(link =>
                !link.title.includes("Wikipedia:") &&
                !link.title.includes("Template:") &&
                !link.title.includes("Help:") &&
                !link.title.includes("Category:") &&
                !link.title.includes("Talk:") &&
                !link.title.includes("File:")
            );

            if (validSecondLinks.length === 0) {
                throw new Error("No valid second level links found");
            }

            // Choisir un lien aléatoire du deuxième niveau
            const randomSecondLink = validSecondLinks[Math.floor(Math.random() * validSecondLinks.length)].title;
            console.log("Second level link:", randomSecondLink);

            return {
                destination: randomSecondLink,
                nearTarget: targetArticle.title
            };

        } catch (error) {
            console.error("Error in primary teleport method:", error);

            // Méthode de secours utilisant les catégories
            try {
                console.log("Trying category-based approach...");
                // Obtenir les catégories de l'article cible
                const categoryUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(targetArticle.title)}&prop=categories&cllimit=50&format=json&origin=*`;
                const categoryResponse = await fetch(categoryUrl);
                const categoryData = await categoryResponse.json();

                const pages = categoryData.query.pages;
                const pageId = Object.keys(pages)[0];

                if (!pages[pageId].categories || pages[pageId].categories.length === 0) {
                    throw new Error("No categories found for target article");
                }

                // Filtrer pour obtenir uniquement les catégories valides
                const validCategories = pages[pageId].categories
                    .filter(cat => !cat.title.includes("stub"))
                    .map(cat => cat.title);

                if (validCategories.length === 0) {
                    throw new Error("No valid categories found");
                }

                // Choisir une catégorie aléatoire
                const randomCategory = validCategories[Math.floor(Math.random() * validCategories.length)];
                console.log("Random category:", randomCategory);

                // Obtenir des articles de cette catégorie
                const articlesInCategoryUrl = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(randomCategory)}&cmlimit=50&cmtype=page&format=json&origin=*`;
                const articlesResponse = await fetch(articlesInCategoryUrl);
                const articlesData = await articlesResponse.json();

                if (!articlesData.query.categorymembers || articlesData.query.categorymembers.length === 0) {
                    throw new Error("No articles found in selected category");
                }

                // Filtrer pour éviter de retomber sur l'article cible
                const validArticles = articlesData.query.categorymembers
                    .filter(article => article.title !== targetArticle.title);

                if (validArticles.length === 0) {
                    throw new Error("No valid articles found in category");
                }

                // Choisir un article aléatoire de la catégorie
                const randomArticle = validArticles[Math.floor(Math.random() * validArticles.length)].title;
                console.log("Random article from category:", randomArticle);

                return {
                    destination: randomArticle,
                    nearTarget: `${targetArticle.title} (via catégorie: ${randomCategory.replace("Category:", "")})`
                };

            } catch (categoryError) {
                console.error("Category-based approach failed:", categoryError);

                // Dernier recours : utiliser la recherche
                try {
                    console.log("Trying search approach...");
                    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(targetArticle.title)}&srlimit=10&format=json&origin=*`;
                    const searchResponse = await fetch(searchUrl);
                    const searchData = await searchResponse.json();

                    if (!searchData.query.search || searchData.query.search.length <= 1) {
                        throw new Error("Not enough search results");
                    }

                    // Filtrer pour éviter de retomber sur l'article cible
                    const validResults = searchData.query.search
                        .filter(result => result.title !== targetArticle.title);

                    if (validResults.length === 0) {
                        throw new Error("No valid search results");
                    }

                    const randomResult = validResults[Math.floor(Math.random() * validResults.length)].title;
                    console.log("Random search result:", randomResult);

                    return {
                        destination: randomResult,
                        nearTarget: `${targetArticle.title} (via recherche)`
                    };

                } catch (searchError) {
                    console.error("Search approach failed:", searchError);

                    // Vraiment dernier recours : article aléatoire
                    const randomResponse = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
                    const randomData = await randomResponse.json();
                    console.log("Using completely random article as last resort");

                    return {
                        destination: randomData.title,
                        nearTarget: "article aléatoire (dernier recours)"
                    };
                }
            }
        }
    };

    useEffect(() => {
        return () => {
            if (snailIntervalId) {
                clearInterval(snailIntervalId);
            }
        };
    }, [snailIntervalId]);

    const checkForArtifact = (title: string) => {
        const snail_timer = localStorage.getItem("snail");
        if (snail_timer) {
            const snail_timer_int = parseInt(snail_timer);
            console.log("you tried to go past the snail ?:",snail_timer_int);
            setIsSnailActive(true);
            setSnailTimer(snail_timer_int);
            setShowSnailPopup(true);
            startSnailTimer();
        }

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
            case "Teleport":
                try {
                    // Takes articles from props
                    const result = await findTeleportDestination(props.articles || []);

                    if (result) {
                        // Stock destination and objective article to show in pop-up
                        setTeleportDestination(result.destination);
                        setShowTeleportPopup(true);

                        // Teleports player to destination
                        props.setPage(result.destination);
                        setPageTitle(result.destination);
                        setCurrentWikiUrl(`https://en.wikipedia.org/wiki/${encodeURIComponent(result.destination)}`);
                    }
                } catch (error) {
                    console.error("Error during teleportation:", error);
                }
                break;
        }

        setArtifactFound(null);
    };

    const handlePageChange = (newTitle: string) => {
        setPageTitle(newTitle);
        props.setPage(newTitle);
        setActualPage(newTitle);
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
            localStorage.setItem("inventory", JSON.stringify(baseInventory));
        }
        setShowArtifactPopup(false);
        setArtifactFound(null);
    };

    const closeTeleportPopup = () => {
        setShowTeleportPopup(false);
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
                    {showTeleportPopup && (
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
                                        <h1 className="artifact-popup-title">You've been teleported!</h1>
                                    </div>
                                    <div className="artifact-popup-body">
                                        <img
                                            src={Teleport}
                                            alt="Teleport"
                                            className="artifact-icon"
                                        />
                                        <div className="artifact-details">
                                            <div className="artifact-name">The Teleporter</div>
                                            <div className="artifact-effect">
                                                You've been teleported to a page that's two links away from one of your target articles!
                                            </div>
                                            <div className="disorientor-destination">
                                                <span>Destination:</span> {teleportDestination}
                                            </div>
                                            <div className="disorientor-message">
                                                You're getting closer...
                                            </div>
                                        </div>
                                        <button onClick={closeTeleportPopup} className="collect-button">
                                            Yay!
                                        </button>
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