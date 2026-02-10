import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export const fetchArticles = async (numberOfArticles = 6) => {
    try {
        // Exécuter le solveur Python et récupérer la sortie JSON
        // Utilisation explicite de python3 pour compatibilité Docker
        const { stdout } = await execPromise('python3 solveur_global.py --json');

        // Parser la sortie JSON
        const data = JSON.parse(stdout);
        const goals = data.goals;

        // Créer les articles à partir des goals
        const fetchedArticles = goals.map((title, id) => ({
            id: id,
            title: title,
            extract: `Article about ${title}`, // Vous pourriez vouloir récupérer le vrai extract
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
            completion: false
        }));

        return fetchedArticles;
    } catch (error) {
        console.error("Error during the fetch of the articles:", error);
        // Fallback vers l'ancienne méthode si nécessaire
        return fallbackFetchArticles(numberOfArticles);
    }
}

// Ancienne méthode comme fallback
const fallbackFetchArticles = async (numberOfArticles = 6) => {
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