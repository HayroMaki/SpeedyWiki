import "../stylesheets/game/Game.css"

import {useEffect, useState} from "react";
import {useRunOnce} from "../components/tools/useRunOnce.tsx";
import {useNavigate} from "react-router-dom";

import {Article} from "../interfaces/Article.tsx";
import {Artifact} from "../interfaces/Artifact.tsx";

import {WikiContentWindow} from "../components/game/WikiContentWindow.tsx";
import {ArticleListWindow} from "../components/game/ArticleListWindow.tsx";
import ChatWindow from "../components/lobby/ChatWindow.tsx"
import AppWindow from "../components/game/AppWindow.tsx";

import baseInventory from "../components/game/Inventory.tsx";
import { useWS } from "../components/WSContext.tsx";

const Game = () => {
  const { getStart, player,setPlayer, getStartingPage} = useWS();
  const [articles, setArticles] = useState<Article[]>([]);
  const [wikiContent, setWikiContent] = useState<string>('');
  const [page, setPage] = useState<string>('');
  const [inventory,setInventory] = useState<Artifact[]>(baseInventory);
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
    setArticles(prevArticles => {
      const updatedArticles = prevArticles.map(article => {
        if (article.title === page) {
          return { ...article, completion: true };
        }
        return article;
      });
  
      if (player) {
        setPlayer(prev =>
          prev
            ? {
                ...prev,
                pages: [...prev.pages, page],
                clicks: (prev.clicks || 0) + 1
              }
            : null
        );
      }
  
      return updatedArticles;
    });
  
    // Vérifie si tous les articles sont complétés
    if (articles.length > 0 && articles.every(article => article.completion)) {
      navigate("/Win");
    }
  };

  useRunOnce({
    fn: () => {
      const m_start = getStart();
      const m_startpage = getStartingPage();
      console.log(m_startpage);
      if (m_start && m_start.text) {
        const start_art: Article[] = m_start.text;
        console.log(start_art);
        setArticles(start_art);
        if (m_startpage) {
          const startpage: Article[] = m_startpage.text;
          console.log(startpage);
          setWikiContent(startpage[1].url);
          setPage(startpage[1].title);
        }
      }
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
          <WikiContentWindow wikiContent={wikiContent} title={page} setPage={setPage} inventory={inventory}/>
          <div className="App_Component">
            <AppWindow articles={articles}/>
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;
