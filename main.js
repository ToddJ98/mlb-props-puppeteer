const express = require('express');
const axios = require('axios');

const app = express();

// BettingPros internal JSON API endpoint for MLB player props
const API_URL = 'https://api.bettingpros.com/v1/picks/mlb/player-prop-bets?category=prop-bets&sport=mlb';

app.get('/mlb-props', async (req, res) => {
  try {
    console.log("🌐 Fetching BettingPros props from internal JSON API...");
    const response = await axios.get(API_URL, {
      headers: {
        'x-bp-api-key': 'web',  // Public key used by their frontend
        'Referer': 'https://www.bettingpros.com/mlb/picks/prop-bets/',
        'User-Agent': 'Mozilla/5.0'
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

    console.log(`✅ Fetched ${props.length} props from BettingPros API`);
    res.json(props);
  } catch (err) {
    console.error("❌ BettingPros API fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch props from BettingPros API" });
  }
});

app.listen(3000, () => {
  console.log('✅ BettingPros JSON API scraper running on port 3000');
});
