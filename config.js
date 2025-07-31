// Bwm xmd by Ibrahim Adams 
const fs = require('fs-extra');
const { Sequelize } = require('sequelize');
const crypto = require('crypto');
const path = require('path');

if (fs.existsSync('config.env'))
require('dotenv').config({ path: __dirname + '/config.env' });

const databasePath = path.join(__dirname, './database.db');
const DATABASE_URL = process.env.DATABASE_URL === undefined
    ? databasePath
    : process.env.DATABASE_URL;

// Add fetch support for restart functionality
let fetch;
try {
    fetch = globalThis.fetch || require('node-fetch');
} catch (error) {
    console.log('⚠️ Fetch not available, will use alternative restart methods');
    fetch = null;
}

// HYBRID CONFIGURATION MANAGER
class HybridConfigManager {
    constructor() {
        this.configDir = path.join(__dirname, 'config');
        this.configFile = path.join(this.configDir, 'settings.json');
        this.backupDir = path.join(this.configDir, 'backups');
        this.sessionId = this.generateSessionId();
        this.cache = new Map();
        this.isHerokuAvailable = false;
        this.herokuClient = null;
        this.appName = null;
        
        this.initializeStorage();
        this.checkHerokuAvailability();
    }

    // ... [Keep all existing HybridConfigManager methods unchanged] ...
}

// QUOTE ROTATION SYSTEM
class QuoteRotator {
    constructor(configManager) {
        this.configManager = configManager;
        this.quotes = [
            "🚀 Stay hungry, stay foolish",
            "💡 The best way to predict the future is to create it",
            "✨ Simplicity is the ultimate sophistication",
            "🌟 Innovation distinguishes leaders from followers",
            "⏳ Your time is limited, don't waste it",
            "🔥 First, solve the problem. Then write the code"
        ];
        this.currentIndex = 0;
        this.interval = 60000; // 60 seconds in milliseconds
        this.startRotation();
    }

    getRandomQuote() {
        this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
        return this.quotes[this.currentIndex];
    }

    startRotation() {
        // Initial update
        this.updateBio();
        
        // Set interval for rotation
        setInterval(() => this.updateBio(), this.interval);
    }

    updateBio() {
        const newQuote = this.getRandomQuote();
        this.configManager.setSetting('PRESENCE', newQuote)
            .then(() => console.log(`🔄 Bio updated: "${newQuote}"`))
            .catch(err => console.error('❌ Failed to update bio:', err));
    }
}

const hybridConfig = new HybridConfigManager();
const quoteRotator = new QuoteRotator(hybridConfig); // Initialize quote rotation

module.exports = {
    hybridConfig,
    quoteRotator,
    session: process.env.SESSION_ID || '',
    sessionId: hybridConfig.getSessionId(),
    PREFIX: process.env.PREFIX || ".",
    GURL: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
    OWNER_NAME: process.env.OWNER_NAME || "Ibrahim Adams",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "",
    BOT: process.env.BOT_NAME || 'BMW_MD',
    BWM_XMD: hybridConfig.buildContentLayer(),
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
    HEROKU_APY_KEY: process.env.HEROKU_APY_KEY,
    WARN_COUNT: process.env.WARN_COUNT || '3',
  
    // Modified AUTO_BIO getter to work with quote rotation
    get AUTO_BIO() { 
        return hybridConfig.getSetting('AUTO_BIO', 'yes') === 'yes' ? 
               hybridConfig.getSetting('PRESENCE', '🚀 BMW_MD is online') : 
               hybridConfig.getSetting('PRESENCE', '🚀 BMW_MD is online'); 
    },

    // ... [Keep all other existing getters and settings unchanged] ...
    
    DATABASE_URL,
    DATABASE: DATABASE_URL === databasePath
        ? "postgresql://postgres:bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX@viaduct.proxy.rlwy.net:47738/railway"
        : "postgresql://postgres:bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX@viaduct.proxy.rlwy.net:47738/railway",
};

let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`Updates ${__filename}`);
    delete require.cache[fichier];
    require(fichier);
});
