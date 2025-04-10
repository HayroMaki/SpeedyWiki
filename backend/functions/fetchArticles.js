export const fetchArticles = async (numberOfArticles = 5) => {

    const fetchedArticles = [];
    let id = 0;

    while (fetchedArticles.length < numberOfArticles) {
        try {
            const response = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
            const data = await response.json();
            const title = data.title;

            if (!fetchedArticles.some(article => article.title === title) || title!="Not found.") {
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
            console.error("Error during the fetch of the articles:", error);
        }
    }
    return fetchedArticles;
}