// BWM-MD WhatsApp Bot Configuration - Stable Version
const fs = require('fs-extra');
const path = require('path');

// Load environment variables
if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: __dirname + '/config.env' });
}

// Improved Configuration Manager
class ConfigManager {
    constructor() {
        this.configDir = path.join(__dirname, 'config');
        this.configFile = path.join(this.configDir, 'settings.json');
        this.backupDir = path.join(this.configDir, 'backups');
        this.cache = new Map();
        
        // Initialize with error handling
        try {
            this.initializeStorage();
            console.log('✓ Config system ready');
        } catch (error) {
            console.error('⚠️ Config initialization failed:', error.message);
            process.exit(1);
        }
    }

    initializeStorage() {
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

        // Load config
        this.loadConfig();
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
            const config = {
                settings: Object.fromEntries(this.cache)
            };
            await fs.writeJson(this.configFile, config, { spaces: 2 });
        } catch (error) {
            console.error('⚠️ Config save failed:', error.message);
        }
    }

    getSetting(key, defaultValue = '') {
        return this.cache.get(key) || defaultValue;
    }
}

// Robust Bio Rotator
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
        
        // Start with error handling
        this.startRotation().catch(console.error);
    }

    async startRotation() {
        try {
            // Initial update
            await this.updateBio();
            
            // Set up regular rotation
            this.rotationTimer = setInterval(() => {
                this.updateBio().catch(console.error);
            }, this.interval);
        } catch (error) {
            console.error('⚠️ Rotation setup failed:', error.message);
        }
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

// Export configuration
module.exports = {
    configManager,
    get ETAT() {
        return configManager.getSetting('PRESENCE', '🚀 BWM-MD Online');
    },
    PREFIX: process.env.PREFIX || ".",
    BOT: process.env.BOT_NAME || 'BWM-MD',
    
    // Watch for file changes
    watchConfig: () => {
        const configFile = path.join(__dirname, 'config.js');
        fs.watchFile(configFile, () => {
            console.log('♻️ Reloading configuration...');
            delete require.cache[require.resolve(configFile)];
            process.exit(0);
        });
    }
};

// Start file watcher if not in production
if (process.env.NODE_ENV !== 'production') {
    module.exports.watchConfig();
}
