const express = require('express');
const axios = require('axios');

const app = express();

const SCRAPERAPI_KEY = '5100e05e1a481daca2122333f4b3b80b';
const FAN_DUEL_URL = 'https://sportsbook.fanduel.com/sports/navigation/baseball/mlb?tab=player-props';

app.get('/mlb-props', async (req, res) => {
  try {
    console.log("📥 Fetching raw FanDuel page via ScraperAPI...");
    const response = await axios.get(`http://api.scraperapi.com`, {
      params: {
        api_key: SCRAPERAPI_KEY,
        url: FAN_DUEL_URL,
        render: true
      }
    });

    console.log("📄 Sending raw HTML...");
    res.set('Content-Type', 'text/html');
    res.send(response.data);
  } catch (err) {
    console.error("❌ ScraperAPI HTML fetch failed:", err.message);
    res.status(500).json({ error: "HTML fetch failed" });
  }
});

app.listen(3000, () => {
  console.log('🧪 Raw HTML dump mode running on port 3000');
});
