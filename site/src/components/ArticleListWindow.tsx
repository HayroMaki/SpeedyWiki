import { useEffect, useState } from "react";

import {Article} from "../interfaces/Article.tsx";

import Cross from "../assets/Icon/Cross_Icon.png";
import Full from "../assets/Icon/FullScreen_Icon.png";
import Reduce from "../assets/Icon/Reduce_Icon.png";

export const ArticleListWindow = (props: {articles : Article[]}) => {
    return (
        <>
            <div className="w-full">
                <div className="h-[50px] bg-[#A2D2F6] border-3 border-[#6d6d6d] flex justify-end items-center border-b-0">
                    <div className="flex flex-row gap-2 mr-2">
                        <img className="h-[35px] md:h-[40px]" src={Reduce}></img>
                        <img className="h-[35px] md:h-[40px]" src={Full}></img>
                        <img className="h-[35px] md:h-[40px]" src={Cross}></img>
                    </div>
                </div>
                <div className="bg-[#EEE6E0] border-3 border-[#6d6d6d] flex text-left  flex-col mb-0">
                    <h1 className="pl-2 text-[22px] md:text-[26px]">Objectives :</h1>
                    <div className="gap-8 w-full h-[340px] bg-white border-3 border-[#6d6d6d] flex flex-col border-l-0 border-r-0 text-left text-[20px] md:text-[20px] md:gap-24 p-1">
                        <ul className="list-none p-0 m-0">
                            {props.articles.map((article) => (
                                <li key={article.id}>
                                    <h1>- {article.title}</h1>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="h-2"></div>
                </div>
            </div>
        </>
    )
}