const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const SCRAPERAPI_KEY = '5100e05e1a481daca2122333f4b3b80b';
const BETTINGPROS_URL = 'https://www.bettingpros.com/mlb/picks/prop-bets/';

app.get('/mlb-props', async (req, res) => {
  try {
    console.log("🌐 Fetching BettingPros props via ScraperAPI...");
    const response = await axios.get(`http://api.scraperapi.com`, {
      params: {
        api_key: SCRAPERAPI_KEY,
        url: BETTINGPROS_URL,
        render: true
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const props = [];

    $('div.bet-pick-row').each((_, el) => {
      const player = $(el).find('.bet-player').text().trim();
      const propLine = $(el).find('.bet-prop').text().trim();
      const confidence = $(el).find('.bet-confidence').text().trim();
      const oddsText = $(el).find('.bet-odds').text().trim();
      const oddsMatch = oddsText.match(/([-+]\\d+)/);
      const odds = oddsMatch ? parseInt(oddsMatch[1], 10) : 'N/A';

      if (player && propLine) {
        props.push({
          player,
          prop: propLine,
          odds,
          confidence: confidence || 'N/A'
        });
      }
    });

    console.log(`✅ Extracted ${props.length} props from BettingPros`);
    res.json(props);
  } catch (err) {
    console.error("❌ BettingPros ScraperAPI error:", err.message);
    res.status(500).json({ error: "BettingPros scrape failed" });
  }
});

app.listen(3000, () => {
  console.log('✅ BettingPros ScraperAPI server running on port 3000');
});
