import "../stylesheets/gamePage/gamePage.css"

import {useState} from "react";
import {useRunOnce} from "../components/tools/useRunOnce.tsx";

import {Article} from "../interfaces/Article.tsx";

import {WikiContentWindow} from "../components/gamePage/WikiContentWindow.tsx";
import {ArticleListWindow} from "../components/gamePage/ArticleListWindow.tsx";
import {ChatWindow} from "../components/gamePage/ChatWindow.tsx"
import {InventoryWindow} from "../components/gamePage/InventoryWindow.tsx";

const GamePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [wikiContent, setWikiContent] = useState<string>('');
  const [page, setPage] = useState<string>('');

  const fetchArticles: () => Promise<Article[]> = async () => {
    const numberOfArticles = 5;
    const fetchedArticles: Article[] = [];

    for (let i = 0; i < numberOfArticles; i++) {
      try {
        const response = await fetch(
            "https://en.wikipedia.org/api/rest_v1/page/random/summary"
        );
        const data = await response.json();
        fetchedArticles.push({
          id: i,
          title: data.title,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
          users: [],
          completion: false
        });
      } catch (error) {
        console.error("Error during the fetch of the articles : ", error);
      }
    }
    return fetchedArticles;
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

  return (
    <>
      <div className="game-page">
        <div className="game-page-side">
          <ArticleListWindow articles={articles}/>
          <ChatWindow/>
        </div>
        <div className="game-page-content">
          <WikiContentWindow wikiContent={wikiContent} title={page} setPage={setPage} />
          <InventoryWindow/>
        </div>
      </div>
    </>
  );
};

export default GamePage;
