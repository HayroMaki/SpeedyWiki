import { useState, useEffect } from "react";

const fetchWikipediaContent = async (title:string) => {
  const response = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch Wikipedia content");
  }
  let html = await response.text();

  // Modify Wikipedia links and remove external links
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll('a[href^="http"], a[href^="//"]').forEach((a) => a.remove());
  doc.querySelectorAll('a[href^="/wiki/"]').forEach((a) => {
    if (a instanceof HTMLAnchorElement) {
      a.href = `/Gamepage${a.getAttribute("href")}`;
    }
  });

  return doc.body.innerHTML;
};
interface WikiRaceProps {
    title: string;
  }
  
  export default function WikiRace({ title }: WikiRaceProps) {
  const [content, setContent] = useState("Loading...");

  useEffect(() => {
    fetchWikipediaContent(title)
      .then(setContent)
      .catch(() => setContent("Failed to load content"));
  }, [title]);

  return (
    <div>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
