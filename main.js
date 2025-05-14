const express = require('express');
const axios = require('axios');

const app = express();

const SCRAPERAPI_KEY = '5100e05e1a481daca2122333f4b3b80b';
const TARGET_API = 'https://api.bettingpros.com/v1/picks/mlb/player-prop-bets?category=prop-bets&sport=mlb';

app.get('/mlb-props', async (req, res) => {
  try {
    console.log("🌐 Fetching BettingPros JSON API via ScraperAPI proxy...");
    const response = await axios.get('http://api.scraperapi.com', {
      params: {
        api_key: SCRAPERAPI_KEY,
        url: TARGET_API,
        render: false
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = response.data;
    const props = [];

    data?.picks?.forEach(pick => {
      if (pick && pick.player_name && pick.pick_title) {
        props.push({
          player: pick.player_name,
          prop: pick.pick_title,
          confidence: pick.hit_rate || "N/A",
          odds: pick.odds || "N/A"
        });
      }
    });

    console.log(`✅ Fetched ${props.length} props from BettingPros via ScraperAPI`);
    res.json(props);
  } catch (err) {
    console.error("❌ Proxy fetch failed:", err.message);
    res.status(500).json({ error: "Proxy API request failed" });
  }
});

app.listen(3000, () => {
  console.log('✅ BettingPros API via ScraperAPI server running on port 3000');
});
