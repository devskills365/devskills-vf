// set-env.js (Version Corrigée pour l'écriture de fichier)

const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // Fallback
}

const localIp = getLocalIp();
const apiUrl = `http://${localIp}:5000`;
const envContent = `VITE_API_BASE_URL=${apiUrl}\n`;

const envPath = path.resolve(__dirname, '.env.local');

// Écrire le contenu dans le fichier .env.local
fs.writeFileSync(envPath, envContent);

console.log(`Adresse IP locale définie dans ${envPath}: ${apiUrl}`);