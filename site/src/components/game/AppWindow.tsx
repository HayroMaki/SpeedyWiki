import { useState } from "react";
import {Article} from "../../interfaces/Article.tsx";
import ArticleListWindow from "./ArticleListWindow";
import ChatWindow from "../lobby/ChatWindow.tsx";

const AppWindow = (props: { articles: Article[]}) => {
const [isContentToggled, setIsContentToggled] = useState(false);

  // Fonction pour basculer entre les deux contenus
  const toggleContent = () => {
    setIsContentToggled(!isContentToggled);
  };

  return(
    <>
    <div>
      {isContentToggled ? (
        <ArticleListWindow articles={props.articles} toggleContent={toggleContent} />
      ) : (
        <ChatWindow toggleContent={toggleContent} />
      )}
    </div>
    </>
  )
}

export default AppWindow