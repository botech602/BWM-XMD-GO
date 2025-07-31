// BWM-MD WhatsApp Bot Configuration
// Enhanced with automatic bio rotation every 60 seconds

const fs = require('fs-extra');
const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables
if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: __dirname + '/config.env' });
}

// Database configuration
const databasePath = path.join(__dirname, './database.db');
const DATABASE_URL = process.env.DATABASE_URL || databasePath;

// Fetch polyfill for restart functionality
let fetch;
try {
    fetch = globalThis.fetch || require('node-fetch');
} catch (error) {
    console.log('⚠️ Fetch not available, using alternative restart methods');
    fetch = null;
}

// Configuration Manager
class HybridConfigManager {
    constructor() {
        // Session ID generator (moved to top of constructor)
        this.generateSessionId = () => {
            return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        };

        this.sessionId = this.generateSessionId();
        this.configDir = path.join(__dirname, 'config');
        this.configFile = path.join(this.configDir, 'settings.json');
        this.backupDir = path.join(this.configDir, 'backups');
        this.cache = new Map();
        this.isHerokuAvailable = false;
        
        this.initializeStorage();
    }

    initializeStorage() {
        try {
            fs.ensureDirSync(this.configDir);
            fs.ensureDirSync(this.backupDir);
            
            if (!fs.existsSync(this.configFile)) {
                this.createDefaultConfig();
            }
            
            this.loadConfigToCache();
            console.log('✅ Config manager initialized');
        } catch (error) {
            console.error('❌ Config initialization failed:', error);
        }
    }

    createDefaultConfig() {
        const defaultConfig = {
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString(),
                sessionId: this.sessionId
            },
            settings: {
                AUTO_BIO: 'yes',
                PRESENCE: '🚀 BWM-MD Online'
                // Other default settings...
            }
        };
        fs.writeFileSync(this.configFile, JSON.stringify(defaultConfig, null, 2));
    }

    // ... [Other existing methods remain unchanged] ...
}

// Bio Rotation System
class BioRotator {
    constructor(configManager) {
        this.config = configManager;
        this.quotes = [
            "🚀 Powered by BWM-MD",
            "💡 Innovation at work",
            "✨ Your digital assistant",
            "🌟 Always online",
            "⏳ 24/7 availability",
            "📱 Connected with you",
            "🤖 AI-powered responses",
            "⚡ Lightning fast service"
        ];
        this.updateInterval = 60000; // 60 seconds
        
        // Start rotation
        this.updateBio();
        this.rotationTimer = setInterval(() => this.updateBio(), this.updateInterval);
    }

    async updateBio() {
        try {
            const randomIndex = Math.floor(Math.random() * this.quotes.length);
            const newBio = this.quotes[randomIndex];
            await this.config.setSetting('PRESENCE', newBio);
            console.log(`🔄 Bio rotated to: "${newBio}"`);
        } catch (error) {
            console.error('⚠️ Bio rotation failed:', error.message);
        }
    }
}

// Initialize components
const hybridConfig = new HybridConfigManager();
const bioRotator = new BioRotator(hybridConfig);

// Module exports
module.exports = {
    hybridConfig,
    session: process.env.SESSION_ID || '',
    sessionId: hybridConfig.sessionId,
    PREFIX: process.env.PREFIX || ".",
    BOT: process.env.BOT_NAME || 'BWM-MD',
    
    // Bio rotation integration
    get ETAT() {
        return hybridConfig.getSetting('PRESENCE', '🚀 BWM-MD Online');
    },
    
    // ... [Other existing exports] ...
    
    DATABASE_URL,
    DATABASE: DATABASE_URL === databasePath
        ? "postgresql://postgres:password@localhost:5432/bwm_md"
        : DATABASE_URL
};

// File watcher
let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`♻️ Reloading ${__filename}`);
    delete require.cache[fichier];
    require(fichier);
});
