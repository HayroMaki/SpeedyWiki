import "../stylesheets/game/Game.css"

import {useEffect, useState} from "react";
import {useRunOnce} from "../components/tools/useRunOnce.tsx";

import {Article} from "../interfaces/Article.tsx";

import {WikiContentWindow} from "../components/game/WikiContentWindow.tsx";
import {ArticleListWindow} from "../components/game/ArticleListWindow.tsx";
import ChatWindow from "../components/lobby/ChatWindow.tsx"
import {useNavigate} from "react-router-dom";
import AppWindow from "../components/game/AppWindow.tsx";

const Game = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [wikiContent, setWikiContent] = useState<string>('');
  const [page, setPage] = useState<string>('');
  const navigate = useNavigate();

  const fetchArticles: () => Promise<Article[]> = async () => {
    const numberOfArticles = 5;
    const fetchedArticles: Article[] = [];
    let id = 0;

    while (fetchedArticles.length < numberOfArticles) {
      try {
        const response = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
        const data = await response.json();
        const title = data.title;

        if (!fetchedArticles.some(article => article.title === title)) {
          fetchedArticles.push({
            id: id,
            title: title,
            extract: data.extract,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
            completion: false
          });
          id++;
        }
      } catch (error) {
        console.error("Error during the fetch of the articles : ", error);
      }
    }
    return fetchedArticles;
  };

  const CheckPage = () => {
    setArticles(prevArticles =>
      prevArticles.map(article =>
        article.title === page ? { ...article, completion: true } : article
      )
    );
    if (articles.length > 0 && articles.every(article => article.completion)) {
      navigate("/Win");
    }
  };

  useRunOnce({
    fn: () => {
      fetchArticles().then(articles => {
        setArticles(articles);
        setWikiContent(articles[0].url);
        setPage(articles[0].title);
      });
    }
  });

  useEffect(() => {
    CheckPage();
  }, [page]);

  return (
    <>
      <div className="game-page">
        <div className="game-page-side">
          <ArticleListWindow articles={articles}/>
          <ChatWindow/>
        </div>
        <div className="game-page-content">
          <WikiContentWindow wikiContent={wikiContent} title={page} setPage={setPage}/>
          <div className="App_Component">
            <AppWindow articles={articles}/>
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;
