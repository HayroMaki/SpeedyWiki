import {useEffect, useState} from "react";

import {Article} from "../interfaces/Article.tsx";

import {ArticleListWindow} from "../components/ArticleListWindow.tsx";
import {ChatWindow} from "../components/ChatWindow.tsx"

import Cross from "../assets/Icon/Cross_Icon.png";
import Full from "../assets/Icon/FullScreen_Icon.png";
import Reduce from "../assets/Icon/Reduce_Icon.png";

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
      <div className="flex flex-row items-center text-center overflow-hidden gap-3">
          <div className="w-[325px] h-full ml-[20px] mt-2 flex flex-col items-center gap-2">
            <ArticleListWindow articles={articles}/>
            <ChatWindow/>
          </div>
        <div className="w-[800px] md:w-[1495px] h-full mt-2 flex flex-col items-center gap-3 mr-[20px]">
          <div className="w-full">
            <div className="h-[50px] bg-[#A2D2F6] border-3 border-[#6d6d6d] flex justify-end items-center border-b-0">
              <div className="flex flex-row gap-2 mr-2">
                <img className="h-[35px] md:h-[40px]" src={Reduce}></img>
                <img className="h-[35px] md:h-[40px]" src={Full}></img>
                <img className="h-[35px] md:h-[40px]" src={Cross}></img>
              </div>
            </div>
            <div className="bg-[#EEE6E0] border-3 border-[#6d6d6d] flex items-center justify-left text-left flex-col ">
            <div className="h-[42px]"></div>
            <section id="Wikipage" className="w-full h-[605px] md:h-[615px] bg-white border-3 border-[#6d6d6d] flex flex-col border-l-0 border-r-0 text-left text-[20px] md:text-[20px] md:gap-24 p-3 overflow-auto">
              <iframe
                src={wikiContent}
                className="w-full h-full"
                sandbox="allow-same-origin"
              ></iframe>
            </section>
              <div className="h-2"></div>
            </div>
          </div>

          <div className="w-full">
            <div className="h-[50px] bg-[#A2D2F6] border-3 border-[#6d6d6d] flex justify-end items-center border-b-0">
              <div className="flex flex-row gap-2 mr-2">
                <img className="h-[35px] md:h-[40px]" src={Reduce}></img>
                <img className="h-[35px] md:h-[40px]" src={Full}></img>
                <img className="h-[35px] md:h-[40px]" src={Cross}></img>
              </div>
            </div>
            <div className="bg-[#EEE6E0] border-3 border-[#6d6d6d]  flex  justify-start text-left flex-col ">
              <h1 className="pl-2 text-[22px] md:text-[26px]">Inventory</h1>
              <div className="gap-8 w-full h-[45px] bg-white border-3 border-[#6d6d6d] item-center flex flex-col border-l-0 border-r-0 text-left text-[32px] md:text-[20px] md:gap-24 p-1">

              </div>
              <div className="h-2"></div>
            </div>
          </div>
        </div>
        </div>
    </>
  );
};

export default GamePage;
