const { chromium } = require('playwright');
const fs = require('fs');

const CURRENCIES = ['USD', 'TRY', 'UAH', 'INR'];
const BASE_URL = 'https://www.nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/';

async function fetchRates() {
  const date = new Date().toISOString().split('T')[0];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = [];

  for (const currency of CURRENCIES) {
    const url = `${BASE_URL}?currencies=${currency}&date=${date}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    const text = await page.evaluate(() => document.body.innerText);
    const json = JSON.parse(text);
    results.push(json[0].currencies[0]);
    console.log(`Fetched ${currency}:`, json[0].currencies[0]);
  }

  await browser.close();

  const output = { date, currencies: results };
  fs.writeFileSync('rates.json', JSON.stringify(output, null, 2));
  console.log('Saved rates.json');
}

fetchRates().catch(err => {
  console.error(err);
  process.exit(1);
});
