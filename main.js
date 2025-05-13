const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const SCRAPERAPI_KEY = '5100e05e1a481daca2122333f4b3b80b';
const FAN_DUEL_URL = 'https://sportsbook.fanduel.com/sports/navigation/baseball/mlb?tab=player-props';

app.get('/mlb-props', async (req, res) => {
  try {
    console.log("🌐 Fetching FanDuel props via ScraperAPI...");
    const response = await axios.get(`http://api.scraperapi.com`, {
      params: {
        api_key: SCRAPERAPI_KEY,
        url: FAN_DUEL_URL,
        render: true
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const props = [];

    $('[data-testid="accordion-card"]').each((_, card) => {
      const playerName = $(card).find('[data-testid="accordion-card-header"]').first().text().trim().split('\n')[0] || 'Unknown Player';

      $(card).find('[data-testid="selection-price"]').each((_, line) => {
        const lineText = $(line).text().trim();
        if (lineText.includes('Over') || lineText.includes('Under')) {
          props.push({
            player: playerName,
            prop: lineText,
            odds: 'see line',
            confidence: 'N/A'
          });
        }
      });
    });

    console.log(`✅ Extracted ${props.length} props`);
    res.json(props);
  } catch (err) {
    console.error("❌ ScraperAPI fetch failed:", err.message);
    res.status(500).json({ error: "ScraperAPI fetch failed" });
  }
});

app.listen(3000, () => {
  console.log('✅ ScraperAPI FanDuel scraper running on port 3000');
});
