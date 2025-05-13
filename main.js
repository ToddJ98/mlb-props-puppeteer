const express = require('express');
const { chromium } = require('playwright-chromium');
const app = express();

app.get('/mlb-props', async (req, res) => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://sportsbook.fanduel.com/sports/navigation/baseball/mlb?tab=player-props', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Wait and click to open player prop tabs
    await page.waitForTimeout(5000);
    const tabButtons = await page.$$('[data-testid="tab-button"]');

    for (const tab of tabButtons) {
      const text = await tab.textContent();
      if (text.toLowerCase().includes('batter') || text.toLowerCase().includes('pitcher')) {
        await tab.click();
        await page.waitForTimeout(3000); // wait for props to load
      }
    }

    const props = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('[data-testid="accordion-card"]');

      cards.forEach(card => {
        const playerHeader = card.querySelector('[data-testid="accordion-card-header"]');
        const playerName = playerHeader ? playerHeader.textContent.trim().split('\n')[0] : "Unknown Player";

        const lines = card.querySelectorAll('[data-testid="selection-price"]');
        lines.forEach(line => {
          const lineText = line.textContent.trim();
          if (lineText.includes("Over") || lineText.includes("Under")) {
            results.push({
              player: playerName,
              prop: lineText,
              odds: "see line",
              confidence: "N/A"
            });
          }
        });
      });

      return results;
    });

    await browser.close();
    res.json(props);
  } catch (err) {
    console.error("❌ Scraping error:", err);
    await browser.close();
    res.status(500).send("Scraping error");
  }
});

app.listen(3000, () => {
  console.log('✅ Interactive FanDuel scraper running on port 3000');
});
