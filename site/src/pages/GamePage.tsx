import "../stylesheets/gamePage.css"

import {useEffect, useState} from "react";

import {Article} from "../interfaces/Article.tsx";

import {WikiContentWindow} from "../components/WikiContentWindow.tsx";
import {ArticleListWindow} from "../components/ArticleListWindow.tsx";
import {ChatWindow} from "../components/ChatWindow.tsx"
import {InventoryWindow} from "../components/InventoryWindow.tsx";

const GamePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [wikiContent, setWikiContent] = useState<string>("");

  const fetchArticles = async () => {
    const numberOfArticles = 5;
    const fetchedArticles: Article[] = [];

    for (let i = 0; i < numberOfArticles; i++) {
      try {
        const response = await fetch(
            "https://fr.wikipedia.org/api/rest_v1/page/random/summary"
        );
        const data = await response.json();
        fetchedArticles.push({
          id: i,
          title: data.title,
          url: `https://fr.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
          users: [],
          completion: false
        });
      } catch (error) {
        console.error("Erreur lors de la récupération de l'article:", error);
      }
    }
    setArticles(fetchedArticles);
  };

  const fetchWikipediaPage = async () => {
    setWikiContent(articles[0].url);
  };

  useEffect(() => {
    fetchArticles();
    if (articles.length > 0) {
      fetchWikipediaPage();
    }
    console.log(articles);
  }, []);

  return (
    <>
      <div className="game-page">
        <div className="game-page-side">
          <ArticleListWindow articles={articles}/>
          <ChatWindow/>
        </div>
        <div className="game-page-content">
          <WikiContentWindow wikiContent={wikiContent}/>
          <InventoryWindow/>
        </div>
        </div>
    </>
  );
};

export default GamePage;
