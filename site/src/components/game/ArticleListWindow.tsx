import "../../stylesheets/game/articleListWindow.css"

import {Article} from "../../interfaces/Article.tsx";

import Cross from "../../assets/icon/Cross_Icon.png";
import Full from "../../assets/icon/FullScreen_Icon.png";
import Reduce from "../../assets/icon/Reduce_Icon.png";

export const ArticleListWindow = (props: {articles : Article[]}) => {
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
                    <h1 className="article-list-title">Objectives :</h1>
                    <div className="article-list-articles-container">
                        <ul id="article-list-articles">
                            {props.articles.map((article) => (
                                <li key={article.id}>
                                    <h1>- {article.title}</h1>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="article-list-bottom-spacer"></div>
                </div>
            </div>
        </>
    )
}

export default ArticleListWindow;