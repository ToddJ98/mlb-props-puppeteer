const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// BettingPros internal JSON API
const TARGET_URL = 'https://api.bettingpros.com/v1/picks/mlb/player-prop-bets?category=prop-bets&sport=mlb';

// ZenRows API Key
const ZENROWS_API_KEY = 'ab60310b1d3d78727c9f73a17dde6ff7f1797253';

app.get('/', (req, res) => {
  res.send('MLB Props API (ZenRows) is running');
});

app.get('/mlb-props', async (req, res) => {
  try {
    console.log("🌐 Fetching BettingPros JSON via ZenRows...");
    const response = await axios.get('https://api.zenrows.com/v1', {
      params: {
        url: TARGET_URL,
        apikey: ZENROWS_API_KEY,
        js_render: 'false'
      },
      headers: {
        Accept: 'application/json'
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

    console.log(`✅ Fetched ${props.length} props from BettingPros via ZenRows`);
    res.json(props);
  } catch (err) {
    console.error("❌ ZenRows fetch failed:", err.message);
    res.status(500).json({ error: "ZenRows API request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ ZenRows-powered server running on port ${PORT}`);
});
