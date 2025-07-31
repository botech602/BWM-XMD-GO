// BWM-MD WhatsApp Bot - Final Production-Ready Version
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// 1. Server Configuration
const app = express();
const PORT = process.env.PORT || 3000;

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    bot: 'BWM-MD',
    uptime: process.uptime()
  });
});

// 2. WhatsApp Client Setup
const client = new Client({
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  session: fs.existsSync('./session.json') ? 
    require('./session.json') : null
});

// 3. Bio Rotation System
class BioManager {
  constructor() {
    this.quotes = [
      "🚀 BWM-MD Connected",
      "💡 Smart WhatsApp Assistant",
      "✨ Always Available",
      "🌟 Premium Service",
      "⏳ Instant Responses"
    ];
    this.updateInterval = 60000; // 60 seconds
    
    this.updateBio(); // Initial update
    this.interval = setInterval(() => this.updateBio(), this.updateInterval);
  }

  async updateBio() {
    try {
      const status = this.quotes[Math.floor(Math.random() * this.quotes.length)];
      await client.setStatus(status);
      console.log('✓ Status Updated:', status);
    } catch (error) {
      console.error('Status Update Error:', error.message);
    }
  }
}

// 4. Client Event Handlers
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code above to authenticate');
});

client.on('ready', () => {
  console.log('✓ Client is ready!');
  new BioManager();
});

client.on('authenticated', (session) => {
  console.log('✓ Authentication successful');
  fs.writeFileSync('./session.json', JSON.stringify(session));
});

client.on('disconnected', (reason) => {
  console.log('Client disconnected:', reason);
  fs.unlinkSync('./session.json');
  process.exit(1);
});

// 5. Message Handling
client.on('message', async msg => {
  if (msg.body === '!ping') {
    await msg.reply('pong');
  }
  // Add your other message handlers here
});

// 6. Startup Sequence
(async () => {
  try {
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });

    // Initialize WhatsApp client
    await client.initialize();
    console.log('✓ WhatsApp client initializing...');

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Shutting down gracefully...');
      clearInterval(bioManager?.interval);
      client.destroy();
      server.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
})();

// Export for testing
module.exports = { client, app };
