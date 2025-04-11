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
  const { getStart, player,setPlayer, getStartingPage, actualPage, setActualPage} = useWS();
  const [articles, setArticles] = useState<Article[]>([]);
  const [wikiContent, setWikiContent] = useState<string>('');
  const [page, setPage] = useState<string>('');
  const [inventory, setInventory] = useState<Artifact[]>(baseInventory);
  const navigate = useNavigate();

  const CheckPage = () => {
    setArticles(prevArticles => {
      const updatedArticles = prevArticles.map(article => {
        if (article.title === page) {
          return { ...article, completion: true };
        }
        return article;
      });

      if (articles.length > 0 && articles.every(article => article.completion)) {
        navigate("/Win");
      }
      
      if (player) {
        setPlayer(prev =>
          prev
            ? {
                ...prev,
                pages:
                  prev.pages[prev.pages.length - 1] !== page
                    ? [...prev.pages, page]
                    : prev.pages,
                clicks:
                  prev.pages[prev.pages.length - 1] !== page
                    ? (prev.clicks || 0) + 1
                    : prev.clicks
              }
            : null
        );
        console.log("click:",player.clicks);
        console.log("history:",player.pages);

        const newUpdatedArticles = updatedArticles.map(article => {
          const isPageVisited = player.pages.includes(article.title);
          if (isPageVisited) {
            return { ...article, completion: true };
          }
          return article;
        });
  
        return newUpdatedArticles;
      }
      return updatedArticles;
    });
  
    if (articles.length > 0 && articles.every(article => article.completion)) {
      navigate("/Win");
    }
  };

  useRunOnce({
    fn: () => {
      // Get the objectives :
      const m_start = getStart();
      if (m_start && m_start.text) {
        const start_art: Article[] = m_start.text;
        console.log("objectifs:",start_art);
        setArticles(start_art);
      }

      // Get the start page or, in case of reloads, the last page visited :
      const m_startpage = getStartingPage();

      if (actualPage !== "") {
        console.log("taking from local :",actualPage);
        const link = "https://en.wikipedia.org/wiki/"+encodeURIComponent(actualPage.replace(" ","_"));
        console.log("link :",link);
        setWikiContent(link);
        setPage(actualPage);

      } else if (m_startpage) {
        const startpage: Article[] = m_startpage.text;
        console.log("starting with:",startpage);
        setWikiContent(startpage[1].url);
        setPage(startpage[1].title);
        setActualPage(startpage[1].title);
      }

      // Get the inventory in case of reloads :
      const stored_inv = localStorage.getItem("inventory");
      if (stored_inv) {
        for (const artifact:Artifact of JSON.parse(stored_inv)) {
          baseInventory.push(artifact);
        }
        setInventory(baseInventory);
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
          <WikiContentWindow wikiContent={wikiContent} title={page} setPage={setPage} inventory={inventory} articles={articles}/>
          <div className="App_Component">
            <AppWindow articles={articles}/>
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;
