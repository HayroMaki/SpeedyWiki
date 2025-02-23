const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001;

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
        const response = await axios.get(url);
        let modifiedHtml = response.data;

        // Modify images that uses a relative link :
        modifiedHtml = modifiedHtml.replace(
            /<img\s+[^>]*src="\/(?!\/)/g,
            `<img src="https://en.wikipedia.org/`
        );

        // Modify links :
        modifiedHtml = modifiedHtml.replace(
            /<a\s+([^>]*?)href="([^"]+)"/g,
            (match, attributes, href) => {

                // If the url leads to an article page (/wiki/) or is an internal link :
                if (href.startsWith("#") || href.startsWith("/wiki/")) {

                    // Vérify if url contains a blocked prefix :
                    if (blockedPrefixes.some(prefix => href.includes(prefix))) {
                        console.log("block : " + href);

                        // If it does, block it :
                        return match.replace(
                            /<a\s+([^>]*?)href="([^"]+)"/,
                            `<a $1 href="$2" style="pointer-events: none; opacity: 0.5;" rel="nofollow"`
                        );
                    }

                    // Convert the link for our proxy :
                    const updatedHref = href.startsWith("/wiki/")
                        ? `http://localhost:${PORT}/proxy?url=https://en.wikipedia.org${href}`
                        : href;
                    return match.replace(href, updatedHref);
                }

                // block any other (external) links :
                return match.replace(
                    /<a\s+([^>]*?)href="([^"]+)"/,
                    `<a $1 href="$2" style="pointer-events: none; opacity: 0.5;" rel="nofollow"`
                );
            }
        );

        // Modify CSS links :
        modifiedHtml = modifiedHtml.replace(
            /href="\/w\/load.php/g,
            `href="https://en.wikipedia.org/w/load.php`
        );

        res.send(modifiedHtml);
    } catch (error) {
        res.status(500).send("Error loading the page.");
    }
});

// Launch the server :
app.listen(PORT, () => {
    console.log(`Serveur proxy démarré sur http://localhost:${PORT}`);
});
