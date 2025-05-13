const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/mlb-props', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://sportsbook.fanduel.com/sports/navigation/baseball/mlb?tab=player-props', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  const html = await page.content();
  const props = [];

  const extracted = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('div')).filter(div =>
      div.textContent.match(/(Total Bases|Hits|Home Runs|RBIs|Strikeouts|Pitching Outs)/)
    );

    const props = [];

    rows.forEach(row => {
      const playerDiv = row.closest('div');
      const playerName = playerDiv?.innerText?.split('\n')[0] || "";
      const lines = playerDiv?.innerText?.split('\n').filter(line =>
        line.includes('Over') || line.includes('Under')
      );

      lines.forEach(line => {
        props.push({
          player: playerName,
          prop: line,
          odds: 'see line',
          confidence: 'N/A'
        });
      });
    });

    return props;
  });

  await browser.close();

  res.json(extracted);
});

app.listen(3000, () => {
  console.log('✅ Puppeteer server running on port 3000');
});
