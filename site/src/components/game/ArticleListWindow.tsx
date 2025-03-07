import "../../stylesheets/game/articleListWindow.css"

import {Article} from "../../interfaces/Article.tsx";

import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";

import { useState } from "react";
import useNotification from "../tools/useNotification.ts";

export const ArticleListWindow = (props: { articles: Article[]; toggleContent?: (() => void) | null }) => {
    const [hoveredArticle, setHoveredArticle] = useState<Article | null>(null);

    return (
        <>
            <div className="article-list-container">
                <div className="article-list-top">
                    <div className="icons-container">
                        <img className='icon' src={Reduce}></img>
                        <img className='icon' src={Full}></img>
                        <img className='icon' src={Cross}></img>
                    </div>
                </div>
                <div className="article-list-content">
                <div className="article-content-top">
                    <h1 className="article-list-title">Objectives :</h1>
                    <button className="article-button button" onClick={() => props.toggleContent && props.toggleContent()}>Chat</button>
                </div>
                    <div className="article-list-content-container">
                        <div className="article-list-articles-container">
                            <ul id="article-list-articles">
                                {props.articles.map((article) => (
                                    <li
                                        key={article.id}
                                        onMouseEnter={() => setHoveredArticle(article)}
                                        onMouseLeave={() => setHoveredArticle(null)}
                                    >
                                        <h1 style={{ textDecoration: article.completion ? "line-through" : "none" }}>
                                            - {article.title}
                                        </h1>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    {hoveredArticle && (
                        <div className="article-list-hover-text">
                            {hoveredArticle.extract}
                        </div>
                    )}
                    </div>
                    <div className="article-list-bottom-spacer"></div>
                </div>
            </div>
        </>
    );
};
export default ArticleListWindow;