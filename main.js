const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const SCRAPERAPI_KEY = '5100e05e1a481daca2122333f4b3b80b';
const BETTINGPROS_URL = 'https://www.bettingpros.com/mlb/picks/prop-bets/';

app.get('/mlb-props', async (req, res) => {
  try {
    console.log("🌐 Fetching BettingPros props via ScraperAPI...");
    const response = await axios.get('http://api.scraperapi.com', {
      params: {
        api_key: SCRAPERAPI_KEY,
        url: BETTINGPROS_URL,
        render: true
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const props = [];

    $('div').each((_, el) => {
      const text = $(el).text().trim();

      // Match structure with player name + prop type + odds + hit rate
      if (
        text &&
        text.match(/Over|Under/) &&
        text.match(/Hit \\d+ of last \\d+/)
      ) {
        const parts = text.split('\n').map(x => x.trim()).filter(Boolean);
        const player = parts[0];
        const propLine = parts.find(x => x.includes("Over") || x.includes("Under")) || "N/A";
        const confidence = parts.find(x => x.includes("Hit")) || "N/A";
        const oddsMatch = propLine.match(/([-+]\\d+)/);
        const odds = oddsMatch ? parseInt(oddsMatch[1], 10) : "N/A";

        if (player && propLine) {
          props.push({ player, prop: propLine, odds, confidence });
        }
      }
    });

    console.log(`✅ Structurally extracted ${props.length} props from BettingPros`);
    res.json(props);
  } catch (err) {
    console.error("❌ BettingPros structural scraper error:", err.message);
    res.status(500).json({ error: "Scraping failed" });
  }
});

app.listen(3000, () => {
  console.log('✅ Structural BettingPros scraper running on port 3000');
});
