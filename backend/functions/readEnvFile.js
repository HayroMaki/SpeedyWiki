import path from "path";
import fs from "fs";

export function readEnvFile(filePath = './.env') {
    const envPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(envPath)) {
        throw new Error(`Le fichier ${filePath} n'existe pas.`);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    return envContent.split('\n').reduce((acc, line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            const value = valueParts.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
            acc[key.trim()] = value;
        }
        return acc;
    }, {});
}