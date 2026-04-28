import { scrapeClaraCalendar } from '../src/lib/clara-scraper';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function extractClara() {
  console.log('Running dedicated Clara scrape...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  const events = await scrapeClaraCalendar(context);
  console.log('Found events:', events.length);
  
  const outPath = path.join(process.cwd(), 'src', 'data', 'clara-events.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(events, null, 2));
  console.log('Saved to', outPath);
  
  await browser.close();
}

extractClara().catch(console.error);
