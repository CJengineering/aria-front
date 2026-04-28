import { chromium } from 'playwright';
import { upsertEvents } from './dataStore';
import { scrapeClaraCalendar } from './clara-scraper';

const ARTISTS = [
  { name: 'Clara Barbier Serrano', url: 'https://clarabarbierserrano.com/' },
  { name: 'Seonwoo Lee', url: 'https://seonwoo-lee.com/' },
  { name: 'Anastasia Koorn', url: 'https://anastasiakoorn.squarespace.com/' },
  { name: 'Charlotte Jane Kennedy', url: 'https://charlottejanekennedy.com/' },
];

export async function runScraper() {
  console.log('Starting parallel Playwright scraper...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  let scrapedData: any[] = [];

  const scrapePromises = ARTISTS.map(async (artist) => {
    try {
      console.log(`Scraping ${artist.name}`);
      
      if (artist.name === 'Clara Barbier Serrano') {
        const claraEvents = await scrapeClaraCalendar(context);
        
        claraEvents.forEach((ev) => {
          scrapedData.push({
            artist: artist.name,
            platform: 'Website/Calendar',
            timeAgo: ev.startDate || ev.rawDate,
            content: `${ev.title}${ev.venue ? ` at ${ev.venue}` : ''}${ev.rawTime ? ` (${ev.rawTime})` : ''}\n${ev.description || ''}`,
            engagement: 'Confirmed',
            type: 'Performance'
          });
        });
        
        console.log(`Done scraping Clara Barbier Serrano calendar (${claraEvents.length} events)`);
        return;
      }

      // Generic fallback for others
      const page = await context.newPage();
      
      await page.goto(artist.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      // Quick wait for JS frameworks
      await page.waitForTimeout(500); 

      const texts = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('p, h1, h2, h3, li'));
        return elements
          .map(el => el.textContent?.trim() || '')
          .filter(text => text.length > 30 && text.length < 500); 
      });

      const bestTexts = Array.from(new Set(texts)).slice(0, 2);

      bestTexts.forEach(text => {
        scrapedData.push({
          artist: artist.name,
          platform: 'Website',
          timeAgo: 'Just scraped',
          content: text.replace(/\s+/g, ' '),
          engagement: 'New Update',
          type: text.toLowerCase().includes('2024') || text.toLowerCase().includes('2025') ? 'Performance' : 'News',
        });
      });
      console.log(`Done scraping ${artist.name}`);
      await page.close();
    } catch (error) {
      console.error(`Failed to scrape ${artist.name}`);
    }
  });

  await Promise.all(scrapePromises);
  await browser.close();

  const result = await upsertEvents(scrapedData);
  return result;
}
