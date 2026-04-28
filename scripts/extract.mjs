import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function extractClaraJS() {
  console.log('Running pure JS Clara scrape...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://clarabarbierserrano.com/calendar', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-aid="CALENDAR_EVENT_DATE"]', { state: 'attached', timeout: 15000 });
  
  const selector = '[data-aid="CALENDAR_BIGGER_SCREEN_CONTAINER"]';
  const fallback = '[data-aid="CALENDAR_SMALLER_SCREEN_CONTAINER"]';
  
  let finalSelector = selector;
  const count = await page.locator(selector).count();
  if (count === 0) finalSelector = fallback;
  
  const rawEvents = await page.locator(finalSelector).evaluateAll((nodes) => {
    return nodes.map((node) => {
      const el = (s) => {
        const found = node.querySelector(s);
        return found ? found.textContent.replace(/\s+/g, ' ').trim() : null;
      };
      
      const descNode = node.querySelector('[data-aid="CALENDAR_DESC_TEXT"]');
      const description = descNode ? descNode.innerText.replace(/\s+/g, ' ').trim() : null;
      
      const px = Array.from(node.querySelectorAll('p[data-ux="Text"]'))
        .map(p => p.textContent.replace(/\s+/g, ' ').trim());
      
      const venue = px.find(t => !description || !description.includes(t)) || null;

      return {
        rawDate: el('[data-aid="CALENDAR_EVENT_DATE"]'),
        title: el('[data-aid="CALENDAR_EVENT_TITLE"]'),
        rawTime: el('[data-aid="CALENDAR_EVENT_TIME"]'),
        venue,
        description,
        sourceUrl: 'https://clarabarbierserrano.com/calendar'
      };
    });
  });

  const outPath = path.join(process.cwd(), 'src', 'data', 'clara-events.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(rawEvents, null, 2));
  console.log('Saved events:', rawEvents.length);
  await browser.close();
}

extractClaraJS().catch(console.error);
