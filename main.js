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
    console.log("🔄 Loading FanDuel props page...");
    await page.goto('https://sportsbook.fanduel.com/sports/navigation/baseball/mlb?tab=player-props', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(6000);

    console.log("📸 Capturing raw HTML of main content area...");
    const html = await page.content();

    await browser.close();
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error("❌ Scraping error:", err);
    await browser.close();
    res.status(500).send("Scraping error");
  }
});

app.listen(3000, () => {
  console.log('🧪 Diagnostic FanDuel scraper running on port 3000');
});
