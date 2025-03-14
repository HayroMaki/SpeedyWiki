import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import {HttpsProxyAgent} from "https-proxy-agent";

const app = express();
const PORT = 3001;
const proxyUrl = 'http://proxy-edu.univ-eiffel.fr:3128';
const agent = new HttpsProxyAgent(proxyUrl);

const blockedPrefixes = [
    "Main_Page", 
    "Wikipedia:", 
    "Help:", 
    "Special:", 
    "File:", 
    "Talk:", 
    "Portal:", 
    "Template:", 
    "Template_talk:", 
    "Category:",
    // add more...
];

// Allow Front-End to make requests :
app.use(cors());

app.get("/proxy", async (req, res) => {
    const url = req.query.url;
    console.log("received : " + url);

    // Verify that url is a valid wikipedia page :
    if (!url.startsWith("https://en.wikipedia.org/wiki/")) {
        return res.status(403).send("");
    }

    try {
        // Get the page's content :
        const response = await fetch(url);
        let modifiedHtml = await response.text();

        // Get the page's title :
        const titleMatch = modifiedHtml.match(/<h1\b[^>]*>(.*?)<\/h1>/i);
        const pageTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "?";

        // Send the page's title to the client using postMessage :
        modifiedHtml += `<script>window.parent.postMessage('${pageTitle}', '*');</script>`;

        // Modify images that uses a relative link :
        modifiedHtml = modifiedHtml.replace(/<img\s+[^>]*src="\/(?!\/)/g, `<img src="https://en.wikipedia.org/`);

        // Modify links :
        modifiedHtml = modifiedHtml.replace(/<a\s+([^>]*?)href="([^"]+)"/g, (match, attributes, href) => {

            // If the url leads to an article page (/wiki/) or is an internal link :
            if (href.startsWith("#") || href.startsWith("/wiki/")) {

                // Vérify if url contains a blocked prefix :
                if (blockedPrefixes.some(prefix => href.includes(prefix))) {
                    // If it does, block it :
                    return match.replace(/<a\s+([^>]*?)href="([^"]+)"/, `<a $1 href="$2" style="pointer-events: none; opacity: 0.5;" rel="nofollow"`);
                }

                // Convert the link for our proxy :
                const updatedHref = href.startsWith("/wiki/")
                    ? `http://localhost:${PORT}/proxy?url=https://en.wikipedia.org${href}`
                    : href;
                return match.replace(href, updatedHref);
            }

            // block any other (external) links :
            return match.replace(/<a\s+([^>]*?)href="([^"]+)"/, `<a $1 href="$2" style="pointer-events: none; opacity: 0.5;" rel="nofollow"`);
        });

        // Modify CSS links :
        modifiedHtml = modifiedHtml.replace(/href="\/w\/load.php/g, `href="https://en.wikipedia.org/w/load.php`);

        // Also block forms :
        modifiedHtml = modifiedHtml.replace(/<form\s+([^>]*?)>/g, (match, attributes) => {
            // Make it disabled while keeping its class and other attributes :
            return `<form ${attributes} style="pointer-events: none; opacity: 0.5;" disabled>`;
        });

        // Create a new stylesheet for the scroll bar :

        // Made with the CSS Scrollbar Generator from CSSPortal :
        // https://www.cssportal.com/css-scrollbar-generator/
        const customScrollCSS = `
<style>
*::-webkit-scrollbar { height: 20px; width: 20px; }
*::-webkit-scrollbar-track { background-color: #EEE6E0; border: 3px solid #6D6D6D; }
*::-webkit-scrollbar-thumb { background-color: #A2D2F6; border: 3px solid #7B8DA9; }
</style>`;

        // Add the stylesheet in the head of the page :
        modifiedHtml = modifiedHtml.replace("<head>", `<head>${customScrollCSS}`);

        res.send(modifiedHtml);
    } catch (error) {
        res.status(500).send("Error loading the page : " + error);
    }
});

// Launch the server :
app.listen(PORT, () => {
    console.log(`Serveur proxy démarré sur http://localhost:${PORT}`);
});
