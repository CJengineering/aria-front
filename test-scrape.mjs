import { chromium } from 'playwright';

async function testScrape() {
  console.log('Testing playwright launch...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Going to Clara...');
  await page.goto('https://clarabarbierserrano.com/', { waitUntil: 'domcontentloaded' });
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Got text length:', text.length);
  await browser.close();
}

testScrape().catch(console.error);
