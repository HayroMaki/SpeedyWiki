import { useState } from "react";
import {Article} from "../../interfaces/Article.tsx";
import ArticleListWindow from "./ArticleListWindow";
import ChatWindow from "../lobby/ChatWindow.tsx";

const AppWindow = (props: { articles: Article[]}) => {
const [isContentToggled, setIsContentToggled] = useState(false);

  // Switch from one content to another :
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