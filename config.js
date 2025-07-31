// BWM-MD WhatsApp Bot Configuration - Stable Version
// Includes automatic bio rotation every 60 seconds
// Fully compatible with Render.com deployment

const fs = require('fs-extra');
const path = require('path');
const express = require('express'); // Added for Render.com compatibility

// Load environment variables
if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: __dirname + '/config.env' });
}

// Create Express app for Render.com health checks
const app = express();
app.get('/health', (req, res) => res.status(200).send('OK'));

// Enhanced Configuration Manager
class ConfigManager {
    constructor() {
        this.configDir = path.join(__dirname, 'config');
        this.configFile = path.join(this.configDir, 'settings.json');
        this.backupDir = path.join(this.configDir, 'backups');
        this.cache = new Map();
        
        this.initializeStorage();
    }

    initializeStorage() {
        try {
            // Ensure directories exist
            fs.ensureDirSync(this.configDir);
            fs.ensureDirSync(this.backupDir);

            // Create default config if missing
            if (!fs.existsSync(this.configFile)) {
                fs.writeFileSync(this.configFile, JSON.stringify({
                    settings: {
                        AUTO_BIO: 'yes',
                        PRESENCE: '🚀 BWM-MD Online'
                    }
                }, null, 2));
            }

            // Load existing config
            this.loadConfig();
            console.log('✓ Configuration system ready');
        } catch (error) {
            console.error('⚠️ Config initialization failed:', error.message);
            process.exit(1);
        }
    }

    loadConfig() {
        try {
            const config = fs.readJsonSync(this.configFile);
            this.cache = new Map(Object.entries(config.settings || {}));
        } catch (error) {
            console.error('⚠️ Config load failed:', error.message);
            this.cache = new Map();
        }
    }

    async setSetting(key, value) {
        this.cache.set(key, value);
        await this.saveConfig();
        return true;
    }

    async saveConfig() {
        try {
            await fs.writeJson(this.configFile, {
                settings: Object.fromEntries(this.cache)
            }, { spaces: 2 });
        } catch (error) {
            console.error('⚠️ Config save failed:', error.message);
        }
    }

    getSetting(key, defaultValue = '') {
        return this.cache.get(key) || defaultValue;
    }
}

// Robust Bio Rotation System
class BioRotator {
    constructor(config) {
        this.config = config;
        this.quotes = [
            "🚀 BWM-MD Connected",
            "💡 Smart WhatsApp Assistant",
            "✨ Always Available",
            "🌟 Premium Service",
            "⏳ Instant Responses",
            "📱 Message Anytime",
            "🤖 AI-Powered Features",
            "⚡ Blazing Fast"
        ];
        this.interval = 60000; // 60 seconds
        
        this.startRotation().catch(console.error);
    }

    async startRotation() {
        // Initial update
        await this.updateBio();
        
        // Set up regular rotation
        this.rotationTimer = setInterval(() => {
            this.updateBio().catch(console.error);
        }, this.interval);
    }

    async updateBio() {
        try {
            const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
            await this.config.setSetting('PRESENCE', randomQuote);
            console.log(`✓ Bio updated: ${randomQuote}`);
        } catch (error) {
            console.error('⚠️ Bio update failed:', error.message);
        }
    }
}

// Initialize systems
const configManager = new ConfigManager();
const bioRotator = new BioRotator(configManager);

// Start Express server for Render.com
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✓ Server listening on port ${PORT}`);
});

// Export configuration
module.exports = {
    configManager,
    bioRotator,
    PORT, // Export PORT for other files if needed
    
    get ETAT() {
        return configManager.getSetting('PRESENCE', '🚀 BWM-MD Online');
    },
    
    PREFIX: process.env.PREFIX || ".",
    BOT: process.env.BOT_NAME || 'BWM-MD',
    SESSION_ID: process.env.SESSION_ID || '',
    
    // Watch for file changes in development
    watchConfig: () => {
        if (process.env.NODE_ENV !== 'production') {
            const configFile = path.join(__dirname, 'config.js');
            fs.watchFile(configFile, () => {
                console.log('♻️ Reloading configuration...');
                delete require.cache[require.resolve(configFile)];
                process.exit(1); // Restart process
            });
        }
    }
};

// Start file watcher if in development mode
if (process.env.NODE_ENV !== 'production') {
    module.exports.watchConfig();
}
