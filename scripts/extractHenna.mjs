import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SOURCE_URL = "http://www.hennamun.com/events";
const ORIGIN = "http://www.hennamun.com";
const ARTIST = "Henna Mun";

function parseGoogleCalendar(url) {
  if (!url) return { titleFromCalendar: null, startDate: null, endDate: null, address: null };
  try {
    const parsed = new URL(url);
    const text = parsed.searchParams.get("text");
    const dates = parsed.searchParams.get("dates");
    const location = parsed.searchParams.get("location");
    let startDate = null; let endDate = null;
    if (dates?.includes("/")) {
      const [startRaw, endRaw] = dates.split("/");
      startDate = googleDateToIso(startRaw);
      endDate = googleDateToIso(endRaw);
    }
    return { titleFromCalendar: text, startDate, endDate, address: location };
  } catch { return { titleFromCalendar: null, startDate: null, endDate: null, address: null }; }
}

function googleDateToIso(value) {
  if (!value) return null;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) return value;
  const [, year, month, day, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

function parseMapAddress(mapUrl) {
  if (!mapUrl) return null;
  try { return new URL(mapUrl).searchParams.get("q"); } catch { return null; }
}

function parseRole(excerptText) {
  const match = excerptText?.match(/Role\s*:\s*([^\n]+)/i);
  return match?.[1]?.trim() || null;
}

async function scrapeHennaMunEvents() {
  console.log('Running pure JS extraction for Henna Mun...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  
  await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector("article.eventlist-event", { state: 'attached', timeout: 15000 }).catch(()=>console.log('Timeout'));
  
  const rawEvents = await page.$$eval("article.eventlist-event", (cards, ORIGIN_FROM_NODE) => {
    const cleanText = (value) => value?.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim() || null;
    const absoluteUrl = (value) => {
      if (!value) return null;
      try { return new URL(value, ORIGIN_FROM_NODE).href; } catch { return null; }
    };

    return cards.map(card => {
      const titleEl = card.querySelector(".eventlist-title-link") || card.querySelector(".eventlist-title");
      const eventLinkEl = card.querySelector(".eventlist-title-link") || card.querySelector(".eventlist-button") || card.querySelector(".eventlist-column-thumbnail");
      const dateEl = card.querySelector(".eventlist-meta-date");
      const timeContainer = card.querySelector(".eventlist-meta-time");
      const startTimeEl = card.querySelector(".event-time-localized-start") || card.querySelector(".eventlist-meta-time time:first-child") || card.querySelector(".event-time-localized");
      const endTimeEl = card.querySelector(".event-time-localized-end") || card.querySelector(".eventlist-meta-time time:last-child");
      const addressEl = card.querySelector(".eventlist-meta-address");
      const mapEl = card.querySelector(".eventlist-meta-address-maplink");
      const excerptEl = card.querySelector(".eventlist-excerpt");
      const excerptText = cleanText(excerptEl?.textContent || null);
      const companyOrPresenter = cleanText(excerptEl?.querySelector("h2")?.textContent || null);
      const googleCalendarEl = card.querySelector(".eventlist-meta-export-google");
      
      let venue = cleanText(addressEl?.textContent || null);
      if (venue) venue = venue.replace(/\(map\)/i, "").trim();

      return {
        title: cleanText(titleEl?.textContent || null),
        eventUrl: absoluteUrl(eventLinkEl?.getAttribute("href")),
        rawDate: cleanText(dateEl?.textContent || null),
        rawTime: cleanText(timeContainer?.textContent || null),
        startTime: cleanText(startTimeEl?.textContent || null),
        endTime: cleanText(endTimeEl?.textContent || null),
        venue,
        mapUrl: absoluteUrl(mapEl?.getAttribute("href")),
        companyOrPresenter,
        excerptText,
        googleCalendarUrl: absoluteUrl(googleCalendarEl?.getAttribute("href"))
      };
    });
  }, ORIGIN);

  const parsedEvents = rawEvents.map(event => {
    const calendarData = parseGoogleCalendar(event.googleCalendarUrl);
    const mapAddress = parseMapAddress(event.mapUrl);
    return {
      artist: ARTIST,
      sourceUrl: SOURCE_URL,
      title: event.title || calendarData.titleFromCalendar,
      rawDate: event.rawDate,
      startDate: calendarData.startDate,
      endDate: calendarData.endDate,
      rawTime: event.rawTime,
      venue: event.venue,
      address: calendarData.address || mapAddress,
      role: parseRole(event.excerptText),
      companyOrPresenter: event.companyOrPresenter,
      description: event.excerptText,
    };
  });

  const outPath = path.join(process.cwd(), 'src', 'data', 'henna-events.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(parsedEvents, null, 2));
  console.log('Saved Henna Mun events:', parsedEvents.length);
  
  await browser.close();
}

scrapeHennaMunEvents().catch(console.error);
