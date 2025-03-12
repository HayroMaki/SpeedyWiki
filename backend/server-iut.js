import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import {HttpsProxyAgent} from "https-proxy-agent";

const app = express();
const PORT = 3001;
const proxyUrl = 'http://proxy-edu.univ-eiffel.fr:3128';
const agent = new HttpsProxyAgent(proxyUrl);

const blockedPrefixes = [
    "Main_Page", "Wikipedia:", "Help:", "Special:", "File:", "Talk:", "Portal:", "Template:", "Template_talk:", "Category:"
];

// Allow Front-End to make requests :
app.use(cors());

app.get("/proxy", async (req, res) => {
    const url = req.query.url;
    console.log("received : " + url);

    if (!url.startsWith("https://en.wikipedia.org/wiki/")) {
        return res.status(403).send("");
    }

    try {
        const response = await fetch(url, { agent });
        let modifiedHtml = await response.text();

        const titleMatch = modifiedHtml.match(/<h1\b[^>]*>(.*?)<\/h1>/i);
        const pageTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "?";

        modifiedHtml += `<script>window.parent.postMessage('${pageTitle}', '*');</script>`;
        modifiedHtml = modifiedHtml.replace(/<img\s+[^>]*src="\/(?!\/)/g, `<img src="https://en.wikipedia.org/`);

        modifiedHtml = modifiedHtml.replace(/<a\s+([^>]*?)href="([^"]+)"/g, (match, attributes, href) => {
            if (href.startsWith("#") || href.startsWith("/wiki/")) {
                if (blockedPrefixes.some(prefix => href.includes(prefix))) {
                    return match.replace(/<a\s+([^>]*?)href="([^"]+)"/, `<a $1 href="$2" style="pointer-events: none; opacity: 0.5;" rel="nofollow"`);
                }
                const updatedHref = href.startsWith("/wiki/")
                    ? `http://localhost:${PORT}/proxy?url=https://en.wikipedia.org${href}`
                    : href;
                return match.replace(href, updatedHref);
            }
            return match.replace(/<a\s+([^>]*?)href="([^"]+)"/, `<a $1 href="$2" style="pointer-events: none; opacity: 0.5;" rel="nofollow"`);
        });

        modifiedHtml = modifiedHtml.replace(/href="\/w\/load.php/g, `href="https://en.wikipedia.org/w/load.php`);
        modifiedHtml = modifiedHtml.replace(/<form\s+([^>]*?)>/g, (match, attributes) => {
            return `<form ${attributes} style="pointer-events: none; opacity: 0.5;" disabled>`;
        });

        const customScrollCSS = `
<style>
*::-webkit-scrollbar { height: 20px; width: 20px; }
*::-webkit-scrollbar-track { background-color: #EEE6E0; border: 3px solid #6D6D6D; }
*::-webkit-scrollbar-thumb { background-color: #A2D2F6; border: 3px solid #7B8DA9; }
</style>`;
        modifiedHtml = modifiedHtml.replace("<head>", `<head>${customScrollCSS}`);

        res.send(modifiedHtml);
    } catch (error) {
        res.status(500).send("Error loading the page : " + error);
    }
});

app.listen(PORT, () => {
    console.log(`Serveur proxy démarré sur http://localhost:${PORT}`);
});
