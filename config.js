// BWM-MD WhatsApp Bot - Final Working Configuration
const fs = require('fs-extra');
const path = require('path');
const express = require('express');

// 1. Initialize Express for Render
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/health', (req, res) => res.status(200).send('OK'));

// 2. Simplified Config Manager (Fixed Error)
class ConfigManager {
    constructor() {
        this.configPath = path.join(__dirname, 'config', 'settings.json');
        this.settings = {};
        this.initialize();
    }

    initialize() {
        try {
            fs.ensureDirSync(path.join(__dirname, 'config'));
            
            if (fs.existsSync(this.configPath)) {
                this.settings = fs.readJsonSync(this.configPath);
            } else {
                this.settings = {
                    AUTO_BIO: 'yes',
                    PRESENCE: '🚀 BWM-MD Online'
                };
                this.save();
            }
        } catch (error) {
            console.error('Config Error:', error);
            this.settings = {};
        }
    }

    save() {
        try {
            fs.writeJsonSync(this.configPath, this.settings);
        } catch (error) {
            console.error('Save Error:', error);
        }
    }

    set(key, value) {
        this.settings[key] = value;
        this.save();
    }

    get(key, defaultValue = '') {
        return this.settings[key] || defaultValue;
    }
}

// 3. Working Bio Rotator (Fixed Error)
class BioRotator {
    constructor(config) {
        this.config = config;
        this.quotes = [
            "🚀 BWM-MD Connected",
            "💡 Smart WhatsApp Assistant",
            "✨ Always Available",
            "🌟 Premium Service"
        ];
        this.updateBio(); // Initial update
        setInterval(() => this.updateBio(), 60000); // 60s rotation
    }

    updateBio() {
        try {
            const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
            this.config.set('PRESENCE', quote);
            console.log('✓ Bio updated:', quote);
        } catch (error) {
            console.error('Bio Error:', error);
        }
    }
}

// 4. Initialize Systems
const config = new ConfigManager();
const bioRotator = new BioRotator(config);

// 5. Start Express Server
app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log('✓ Bio rotation active');
});

// 6. Export Configuration
module.exports = {
    config,
    get ETAT() {
        return config.get('PRESENCE');
    },
    PREFIX: process.env.PREFIX || ".",
    BOT: process.env.BOT_NAME || 'BWM-MD',
    PORT
};

// Handle shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully');
    process.exit(0);
});
