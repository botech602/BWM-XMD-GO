// BWM-MD WhatsApp Bot Configuration - Render.com Optimized
const fs = require('fs-extra');
const path = require('path');
const express = require('express');

// 1. Initialize Express server for Render.com requirements
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint (required by Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'BWM-MD WhatsApp Bot',
    uptime: process.uptime()
  });
});

// 2. Configuration Manager
class ConfigManager {
  constructor() {
    this.configDir = path.join(__dirname, 'config');
    this.configFile = path.join(this.configDir, 'settings.json');
    this.cache = new Map();
    this.initialize();
  }

  initialize() {
    try {
      fs.ensureDirSync(this.configDir);
      if (!fs.existsSync(this.configFile)) {
        fs.writeJsonSync(this.configFile, {
          settings: {
            AUTO_BIO: 'yes',
            PRESENCE: '🚀 BWM-MD Online'
          }
        });
      }
      this.loadConfig();
    } catch (error) {
      console.error('Config Error:', error.message);
      process.exit(1);
    }
  }

  loadConfig() {
    try {
      const { settings } = fs.readJsonSync(this.configFile);
      this.cache = new Map(Object.entries(settings));
    } catch (error) {
      console.error('Load Config Error:', error.message);
    }
  }

  async setSetting(key, value) {
    this.cache.set(key, value);
    await this.saveConfig();
  }

  async saveConfig() {
    try {
      await fs.writeJson(this.configFile, {
        settings: Object.fromEntries(this.cache)
      }, { spaces: 2 });
    } catch (error) {
      console.error('Save Config Error:', error.message);
    }
  }

  getSetting(key, defaultValue = '') {
    return this.cache.get(key) ?? defaultValue;
  }
}

// 3. Bio Rotation System
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
    this.startRotation();
  }

  async startRotation() {
    // Initial update
    await this.updateBio();
    
    // Regular rotation every 60 seconds
    setInterval(() => this.updateBio(), 60000);
  }

  async updateBio() {
    try {
      const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
      await this.config.setSetting('PRESENCE', quote);
      console.log('Bio Updated:', quote);
    } catch (error) {
      console.error('Bio Update Error:', error.message);
    }
  }
}

// 4. Initialize Systems
const config = new ConfigManager();
const bioRotator = new BioRotator(config);

// 5. Start Express Server (Required for Render)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Bio rotation started');
});

// 6. Export Configuration
module.exports = {
  config,
  get ETAT() {
    return config.getSetting('PRESENCE', '🚀 BWM-MD Online');
  },
  PREFIX: process.env.PREFIX || ".",
  BOT: process.env.BOT_NAME || 'BWM-MD',
  SESSION_ID: process.env.SESSION_ID || ''
};

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully');
  process.exit(0);
});
