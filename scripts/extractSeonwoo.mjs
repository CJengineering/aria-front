import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SOURCE_URL = "https://www.seonwoo-lee.com/schedule";
const ARTIST = "Seonwoo Lee";
const seasonRegex = /^\d{4}\s*-\s*\d{4}$/;
const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;

function cleanText(value) {
  return value
    ?.replace(/\u200B/g, "")
    .replace(/\s+/g, " ")
    .trim() || "";
}

function parseDetail(details, label) {
  const regex = new RegExp(`${label}\\s*:\\s*([^\\n]+)`, "i");
  const match = details.match(regex);
  return match?.[1]?.trim() || null;
}

function parseCity(venue) {
  if (!venue || !venue.includes(",")) return null;
  return venue.split(",").pop()?.trim() || null;
}

async function scrapeSeonwoo() {
  console.log('Running pure JS Seonwoo Lee scrape...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-testid="richTextElement"]', { state: 'attached', timeout: 15000 });
  
  // Wait to let Wix components settle
  await page.waitForTimeout(3000); 

  const eventCards = await page.$$eval("div", containers => {
    return containers
      .map(container => {
        const img = container.querySelector("img");
        if (img && (img.width < 50 && img.height < 50)) return null; 

        // Extracting text elements
        const textEls = Array.from(
          container.querySelectorAll('[data-testid="richTextElement"]')
        );

        const texts = textEls
          .map(el => el.textContent?.replace(/\u200B/g, "").trim())
          .filter(Boolean);

        const hasDate = texts.some(text =>
          /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(text || "")
        );

        if (!img || texts.length < 4 || !hasDate) return null;

        return {
          imageUrl: img.getAttribute("src"),
          imageAlt: img.getAttribute("alt"),
          texts
        };
      })
      .filter(Boolean);
  });

  const events = [];
  let currentSeason = null;

  eventCards.forEach(card => {
    const texts = card.texts;
    let foundEvent = false;

    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        if (seasonRegex.test(text)) {
            currentSeason = text;
            continue;
        }
        if (!dateRegex.test(text)) {
            continue;
        }

        const rawDate = text;
        const title = texts[i + 1] || null;
        const composer = texts[i + 2] || null;
        const venue = texts[i + 3] || null;
        const details = texts[i + 4] || "";

        const event = {
            artist: ARTIST,
            sourceUrl: SOURCE_URL,
            season: currentSeason,
            rawDate,
            title,
            composer,
            venue,
            city: parseCity(venue),
            country: null,
            role: parseDetail(details, "Role"),
            conductor: parseDetail(details, "Conductor"),
            director: parseDetail(details, "Director"),
            imageUrl: card.imageUrl,
            imageAlt: card.imageAlt,
            rawText: [rawDate, title, composer, venue, details]
                .filter(Boolean)
                .join("\n")
        };
        events.push(event);
        foundEvent = true;
        break; 
    }
  });

  const seen = new Set();
  const deduped = events.filter((event) => {
    const key = [event.rawDate, event.title, event.composer, event.venue].join('|').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log('Extracted Seonwoo Lee events:', deduped.length);
  const outPath = path.join(process.cwd(), 'src', 'data', 'seonwoo-events.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(deduped, null, 2));

  await browser.close();
  process.exit(0);
}

scrapeSeonwoo().catch(e => {
  console.error(e);
  process.exit(1);
});
