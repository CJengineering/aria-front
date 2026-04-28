import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SOURCE_URL = "https://anastasiakoorn.squarespace.com/calendar";
const ORIGIN = "https://anastasiakoorn.squarespace.com";
const ARTIST = "Anastasia Koorn";

function parseGoogleCalendarDates(url) {
  if (!url) return { startDate: null, endDate: null, address: null, titleFromCalendar: null };
  try {
    const parsed = new URL(url);
    const dates = parsed.searchParams.get("dates");
    const location = parsed.searchParams.get("location");
    const text = parsed.searchParams.get("text");

    let startDate = null;
    let endDate = null;

    if (dates?.includes("/")) {
      const [startRaw, endRaw] = dates.split("/");
      startDate = googleDateToIso(startRaw);
      endDate = googleDateToIso(endRaw);
    }
    return { startDate, endDate, address: location || null, titleFromCalendar: text || null };
  } catch { return { startDate: null, endDate: null, address: null, titleFromCalendar: null }; }
}

function googleDateToIso(value) {
  if (!value) return null;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) return value;
  const [, year, month, day, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

async function scrapeAnastasiaKoornCalendar() {
  console.log('Starting pure JS extraction for Anastasia Koorn...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  
  await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  
  // Try preferred selector, fallback to summary
  let selector = "article.eventlist-event";
  let count = await page.locator(selector).count();
  if (count === 0) {
     selector = ".summary-item";
     count = await page.locator(selector).count();
  }
  
  console.log('Found elements matching ' + selector + ':', count);

  const rawEvents = await page.$$eval(selector, (cards, ROOT_ORIGIN) => {
    const cleanText = (value) => {
      return value?.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim() || null;
    };
    const absoluteUrl = (value) => {
      if (!value) return null;
      try { return new URL(value, ROOT_ORIGIN).href; } catch { return null; }
    };

    return cards.map(card => {
      const titleEl = card.querySelector(".eventlist-title a") || card.querySelector(".eventlist-title") || card.querySelector(".summary-title");
      const dateEl = card.querySelector(".eventlist-meta-date") || card.querySelector(".event-date") || card.querySelector("time") || card.querySelector(".summary-metadata-item--date");
      const addressEl = card.querySelector(".eventlist-meta-address") || card.querySelector(".summary-metadata-item--location");
      const mapEl = card.querySelector(".eventlist-meta-address-maplink");
      const excerptEl = card.querySelector(".eventlist-excerpt") || card.querySelector(".summary-excerpt");
      const googleCalendarEl = card.querySelector(".eventlist-meta-export-google");
      
      let venue = cleanText(addressEl?.textContent || null);
      if (venue) venue = venue.replace(/\(map\)/i, "").trim();

      return {
        title: cleanText(titleEl?.textContent || null),
        rawDate: cleanText(dateEl?.textContent || null),
        venue,
        description: cleanText(excerptEl?.textContent || null),
        googleCalendarUrl: absoluteUrl(googleCalendarEl?.getAttribute("href"))
      };
    });
  }, ORIGIN);

  const seen = new Set();
  
  const parsedEvents = rawEvents.map(event => {
    const parsedCalendar = parseGoogleCalendarDates(event.googleCalendarUrl);
    return {
      artist: ARTIST,
      sourceUrl: SOURCE_URL,
      title: event.title || parsedCalendar.titleFromCalendar,
      rawDate: event.rawDate,
      startDate: parsedCalendar.startDate,
      endDate: parsedCalendar.endDate,
      venue: event.venue,
      address: parsedCalendar.address,
      description: event.description
    };
  }).filter((event) => {
    if (!event.title && !event.rawDate) return false;
    const key = [event.title, event.rawDate || event.startDate].join('|').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const outPath = path.join(process.cwd(), 'src', 'data', 'anastasia-events.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(parsedEvents, null, 2));
  console.log('Saved Anastasia Koorn events:', parsedEvents.length);
  
  await browser.close();
}

scrapeAnastasiaKoornCalendar().catch(console.error);
