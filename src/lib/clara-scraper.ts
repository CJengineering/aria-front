import { BrowserContext } from 'playwright';

export type CalendarEvent = {
  rawDate: string;
  startDate?: string | null;
  endDate?: string | null;
  rawTime?: string | null;
  title: string;
  venue?: string | null;
  city?: string | null;
  countryEmoji?: string | null;
  description?: string | null;
  externalLinks: string[];
  sourceUrl: string;
};

const SOURCE_URL = 'https://clarabarbierserrano.com/calendar';

export async function scrapeClaraCalendar(context: BrowserContext): Promise<CalendarEvent[]> {
  const page = await context.newPage();

  try {
    await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-aid="CALENDAR_EVENT_DATE"]', { state: 'attached', timeout: 15000 });

    const selector = '[data-aid="CALENDAR_BIGGER_SCREEN_CONTAINER"]';
    const fallbackSelector = '[data-aid="CALENDAR_SMALLER_SCREEN_CONTAINER"]';

    const eventCount = await page.locator(selector).count();
    const finalSelector = eventCount > 0 ? selector : fallbackSelector;

    // Execute script in browser context to parse the DOM
    const rawEvents = await page.locator(finalSelector).evaluateAll((nodes, url) => {
      const cleanText = (value?: string | null) => {
        return value?.replace(/\s+/g, ' ').trim() || null;
      };

      return nodes.map((node) => {
        const root = node as HTMLElement;

        const rawDate = cleanText(root.querySelector('[data-aid="CALENDAR_EVENT_DATE"]')?.textContent);
        const title = cleanText(root.querySelector('[data-aid="CALENDAR_EVENT_TITLE"]')?.textContent);
        const rawTime = cleanText(root.querySelector('[data-aid="CALENDAR_EVENT_TIME"]')?.textContent);

        const descriptionNode = root.querySelector('[data-aid="CALENDAR_DESC_TEXT"]') as HTMLElement | null;
        const description = cleanText(descriptionNode?.innerText || descriptionNode?.textContent);

        const externalLinks = descriptionNode
          ? Array.from(descriptionNode.querySelectorAll('a[href]')).map((a) => (a as HTMLAnchorElement).href)
          : [];

        const textParagraphs = Array.from(root.querySelectorAll('p[data-ux="Text"]'))
          .map((p) => cleanText(p.textContent))
          .filter(Boolean) as string[];

        // Venue is usually a text paragraph that is NOT the description
        const venue = textParagraphs.find((text) => !description || !description.includes(text)) || null;

        return {
          rawDate: rawDate || '', // Keep guaranteed string to prevent dedupe crashes later
          startDate: null,
          endDate: null,
          rawTime,
          title: title || '',
          venue,
          city: null, // Basic extraction doesn't perfectly segment city yet
          countryEmoji: null,
          description,
          externalLinks,
          sourceUrl: url,
        };
      });
    }, SOURCE_URL);

    // Node-side post-processing to normalize dates and deduplicate
    const events: CalendarEvent[] = rawEvents
      .filter(e => e.title && e.rawDate)
      .map(e => {
        // Normalization attempt for French dates
        const mappedDate = normalizeFrenchDate(e.rawDate);
        return {
          ...e,
          ...mappedDate, // spreads startDate and endDate
        };
      });

    const seen = new Set<string>();
    const deduped = events.filter((event) => {
      const key = [event.rawDate, event.title, event.rawTime, event.venue]
        .map((v) => v || '')
        .join('|')
        .toLowerCase();

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    await page.close();
    return deduped;
  } catch (error) {
    console.error('Failed to scrape Clara Barbier calendar:', error);
    await page.close();
    return [];
  }
}

function normalizeFrenchDate(raw: string): { startDate: string | null; endDate: string | null } {
  // French months mapping
  const months: Record<string, string> = {
    'janv': '01', 'janvier': '01',
    'févr': '02', 'fevr': '02', 'février': '02',
    'mars': '03',
    'avr': '04', 'avril': '04',
    'mai': '05',
    'juin': '06',
    'juil': '07', 'juillet': '07',
    'août': '08', 'aout': '08',
    'sept': '09', 'septembre': '09',
    'oct': '10', 'octobre': '10',
    'nov': '11', 'novembre': '11',
    'déc': '12', 'dec': '12', 'décembre': '12'
  };

  const lowerRaw = raw.toLowerCase();
  
  // Example "29 nov 2025"
  let match = lowerRaw.match(/^(\d{1,2})\s+([a-zûé]+\b)\s+(\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = months[match[2]];
    const year = match[3];
    if (month) {
      return { startDate: `${year}-${month}-${day}`, endDate: null };
    }
  }

  // Example "12/13 juin 2026"
  match = lowerRaw.match(/^(\d{1,2})\/(\d{1,2})\s+([a-zûé]+\b)\s+(\d{4})$/);
  if (match) {
    const day1 = match[1].padStart(2, '0');
    const day2 = match[2].padStart(2, '0');
    const month = months[match[3]];
    const year = match[4];
    if (month) {
      return { startDate: `${year}-${month}-${day1}`, endDate: `${year}-${month}-${day2}` };
    }
  }

  // Example "25 sept/ 2/5 oct 2025" (rough logic for earliest/latest)
  // This is highly ambiguous for regex, so if it fails strict matching, return null
  return { startDate: null, endDate: null };
}
