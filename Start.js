const { exec } = require("child_process");
const path = require("path");

// Fonction pour exécuter une commande dans un dossier spécifique
const runCommand = (command, location) => {
  const process = exec(command, { cwd: location });

  process.stdout.on("data", (data) => {
    console.log(`[${location}] ${data}`);
  });

  process.stderr.on("data", (data) => {
    console.error(`[${location} ERROR] ${data}`);
  });
  process.on("close", (code) => {
    console.log(`[${location}] Process exited with code ${code}`);
  });
};

// Démarrer le backend (Node.js)
//runCommand("node server-iut.js", path.join(__dirname, "backend"));
runCommand("node server.js", path.join(__dirname, "backend"));

runCommand("node websocket.js", path.join(__dirname, "backend"));

// Démarrer le frontend (React)
runCommand("npm run dev", path.join(__dirname, "site"));