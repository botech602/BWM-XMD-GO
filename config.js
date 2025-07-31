// Bwm xmd by Ibrahim Adams - URL Safe Version
const fs = require('fs-extra');
const { Sequelize } = require('sequelize');
const crypto = require('crypto');
const path = require('path');
const { URL } = require('url'); // Added for URL validation

if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: __dirname + '/config.env' });
}

// URL Validation Helper
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false; 
    }
}

// Safe Database URL Handling
const databasePath = path.join(__dirname, './database.db');
let DATABASE_URL = databasePath;

if (process.env.DATABASE_URL && isValidUrl(process.env.DATABASE_URL)) {
    DATABASE_URL = process.env.DATABASE_URL;
} else if (process.env.DATABASE_URL) {
    console.warn('⚠️ Invalid DATABASE_URL in environment, falling back to local SQLite');
}

// Add fetch support for restart functionality
let fetch;
try {
    fetch = globalThis.fetch || require('node-fetch');
} catch (error) {
    console.log('⚠️ Fetch not available, will use alternative restart methods');
    fetch = null;
}

// HYBRID CONFIGURATION MANAGER (Keep original class implementation)
class HybridConfigManager {
    // ... [Keep all your original HybridConfigManager code exactly as is] ...
}

const hybridConfig = new HybridConfigManager();

// Safe URL handling for all external URLs
const DEFAULT_CHANNEL = 'https://whatsapp.com';
const DEFAULT_IMAGES = [
    'https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879883/whatsapp_uploads/e3eprzkzxhwfx7pmemr5.jpg',
    'https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879901/whatsapp_uploads/hqagxk84idvf899rhpfj.jpg',
    'https://res.cloudinary.com/dptzpfgtm/image/upload/v1748879921/whatsapp_uploads/bms318aehnllm6sfdgql.jpg'
].filter(url => isValidUrl(url));

module.exports = {
    hybridConfig,
    session: process.env.SESSION_ID || '',
    sessionId: hybridConfig.getSessionId(),
    PREFIX: process.env.PREFIX || ".",
    
    // Safe URL handling
    GURL: process.env.CHANNEL_URL && isValidUrl(process.env.CHANNEL_URL) 
        ? process.env.CHANNEL_URL 
        : DEFAULT_CHANNEL,
    
    BOT_URL: process.env.BOT_URL 
        ? process.env.BOT_URL.split(',').filter(url => isValidUrl(url))
        : DEFAULT_IMAGES,
    
    // Database configuration
    DATABASE_URL,
    DATABASE: isValidUrl(DATABASE_URL) 
        ? DATABASE_URL 
        : "sqlite:" + databasePath,
    
    // ... [Keep all other original exports exactly as is] ...
    
    // Original footer and other settings
    FOOTER: process.env.BOT_FOOTER || '\n\nFor more info visit: bwmxmd.online\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥',
    
    // ... [Rest of your existing exports] ...
};

// File watcher
let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`Updates ${__filename}`);
    delete require.cache[fichier];
    require(fichier);
});
