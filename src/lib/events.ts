import claraEvents from '@/data/clara-events.json';
import seonwooEvents from '@/data/seonwoo-events.json';
import anastasiaEvents from '@/data/anastasia-events.json';
import hennaEvents from '@/data/henna-events.json';

export interface NormalizedEvent {
  id: string;
  artist: string;
  platform: string;
  rawDate: string;
  sortDate: number; // unix timestamp for sorting
  title: string;
  venue: string;
  detail: string;
  type: string;
}

// Try to extract a sortable date from various raw formats
function parseSortDate(raw: string | null | undefined, startDate?: string | null): number {
  // Prefer ISO startDate if available
  if (startDate) {
    const d = new Date(startDate);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  if (!raw) return 0;

  // Try direct Date parse
  const direct = new Date(raw);
  if (!isNaN(direct.getTime())) return direct.getTime();

  // Try extracting "DD Mon YYYY" pattern (Clara format: "29 nov 2025")
  const frMonths: Record<string, string> = {
    'janv':'Jan','jan':'Jan','janvier':'Jan','févr':'Feb','fevr':'Feb','février':'Feb','fev':'Feb',
    'mars':'Mar','mar':'Mar','avr':'Apr','avril':'Apr','apr':'Apr','mai':'May','may':'May',
    'juin':'Jun','jun':'Jun','juil':'Jul','juillet':'Jul','jul':'Jul','july':'Jul',
    'août':'Aug','aout':'Aug','aug':'Aug','sept':'Sep','sep':'Sep','septembre':'Sep',
    'oct':'Oct','octobre':'Oct','nov':'Nov','novembre':'Nov','déc':'Dec','dec':'Dec','décembre':'Dec',
  };

  // Match first "number month year" pattern
  const m = raw.toLowerCase().match(/(\d{1,2})\s+([a-zéûü]+)\s+(\d{4})/);
  if (m) {
    const day = m[1];
    const month = frMonths[m[2]] || m[2];
    const year = m[3];
    const attempt = new Date(`${day} ${month} ${year}`);
    if (!isNaN(attempt.getTime())) return attempt.getTime();
  }

  // Match "Month YYYY" (e.g. "Oct 2025")
  const m2 = raw.toLowerCase().match(/^([a-zéûü]+)\s+(\d{4})$/);
  if (m2) {
    const month = frMonths[m2[1]] || m2[1];
    const attempt = new Date(`1 ${month} ${m2[2]}`);
    if (!isNaN(attempt.getTime())) return attempt.getTime();
  }

  // Seonwoo pattern: "19 Jan ~ 30 Jan 2026" — extract first date
  const m3 = raw.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
  if (m3) {
    const yearMatch = raw.match(/(\d{4})/);
    const year = yearMatch ? yearMatch[1] : '2025';
    const attempt = new Date(`${m3[1]} ${m3[2]} ${year}`);
    if (!isNaN(attempt.getTime())) return attempt.getTime();
  }

  return 0;
}

export function getAllEvents(): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];

  claraEvents.forEach((ev: any, i: number) => {
    events.push({
      id: `clara-${i}`,
      artist: 'Clara Barbier Serrano',
      platform: 'Website',
      rawDate: ev.rawDate || '',
      sortDate: parseSortDate(ev.rawDate),
      title: ev.title || '',
      venue: ev.venue || '',
      detail: `${ev.title}${ev.venue ? `\n📍 ${ev.venue}` : ''}${ev.rawTime ? `\n🕒 ${ev.rawTime}` : ''}${ev.description ? `\n\n${ev.description}` : ''}`,
      type: 'Performance',
    });
  });

  seonwooEvents.forEach((ev: any, i: number) => {
    events.push({
      id: `seonwoo-${i}`,
      artist: 'Seonwoo Lee',
      platform: 'Wix Calendar',
      rawDate: ev.rawDate || '',
      sortDate: parseSortDate(ev.rawDate),
      title: ev.title || '',
      venue: ev.venue || '',
      detail: `${ev.title}${ev.composer ? `\n🎵 ${ev.composer}` : ''}${ev.venue ? `\n📍 ${ev.venue}` : ''}${ev.role ? `\n🎭 ${ev.role}` : ''}${ev.conductor ? `\n🎼 ${ev.conductor}` : ''}`,
      type: 'Schedule',
    });
  });

  anastasiaEvents.forEach((ev: any, i: number) => {
    events.push({
      id: `anastasia-${i}`,
      artist: 'Anastasia Koorn',
      platform: 'Squarespace',
      rawDate: ev.rawDate || '',
      sortDate: parseSortDate(ev.rawDate, ev.startDate),
      title: ev.title || '',
      venue: ev.venue || ev.address || '',
      detail: `${ev.title}${ev.venue ? `\n📍 ${ev.venue}` : ''}${ev.address ? `\n🗺️ ${ev.address}` : ''}${ev.description ? `\n\n${ev.description}` : ''}`,
      type: 'Calendar Event',
    });
  });

  hennaEvents.forEach((ev: any, i: number) => {
    events.push({
      id: `henna-${i}`,
      artist: 'Henna Mun',
      platform: 'Squarespace',
      rawDate: ev.rawDate || '',
      sortDate: parseSortDate(ev.rawDate, ev.startDate),
      title: ev.title || '',
      venue: ev.venue || '',
      detail: `${ev.title}${ev.venue ? `\n📍 ${ev.venue}` : ''}${ev.role ? `\n🎭 ${ev.role.substring(0, 60)}` : ''}${ev.companyOrPresenter ? `\n🏛️ ${ev.companyOrPresenter}` : ''}`,
      type: 'Calendar Event',
    });
  });

  // Sort by date, closest future first
  const now = Date.now();
  events.sort((a, b) => {
    const aFuture = a.sortDate >= now;
    const bFuture = b.sortDate >= now;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    if (aFuture && bFuture) return a.sortDate - b.sortDate; // nearest future first
    return b.sortDate - a.sortDate; // most recent past first
  });

  return events;
}

export const ARTISTS = [
  {
    slug: 'clara-barbier-serrano',
    name: 'Clara Barbier Serrano',
    country: 'France',
    year: 2020,
    type: 'Soprano',
    bio: 'French soprano, now based in Germany. Inaugural Bocelli scholar (2020). Active in baroque and contemporary opera across Europe.',
    website: 'https://clarabarbierserrano.com',
    instagram: null,
  },
  {
    slug: 'seonwoo-lee',
    name: 'Seonwoo Lee',
    country: 'South Korea',
    year: 2022,
    type: 'Soprano',
    bio: 'South Korean soprano based in Munich, member of the Bayerische Staatsoper Opernstudio. Represented by Rayfield Allied.',
    website: 'https://seonwoo-lee.com',
    instagram: 'https://www.instagram.com/seonwoolee_sop/',
  },
  {
    slug: 'anastasia-koorn',
    name: 'Anastasia Koorn',
    country: 'United States',
    year: 2023,
    type: 'Mezzo-soprano',
    bio: 'American mezzo-soprano. Masters student at the Royal College of Music, performing with Glyndebourne and Palm Beach Opera.',
    website: 'https://anastasiakoorn.squarespace.com',
    instagram: 'https://www.instagram.com/anastasiakoornmezzo/',
  },
  {
    slug: 'henna-mun',
    name: 'Henna Mun',
    country: 'South Korea',
    year: 2023,
    type: 'Soprano',
    bio: 'South Korean soprano. Harewood Artist with the English National Opera and 2024 John Christie Award recipient at Glyndebourne Festival.',
    website: 'https://hennamun.com',
    instagram: 'https://www.instagram.com/hennamun_soprano/',
  },
  {
    slug: 'charlotte-jane-kennedy',
    name: 'Charlotte Jane Kennedy',
    country: 'United Kingdom',
    year: 2025,
    type: 'Soprano',
    bio: 'British soprano, masters student at the RCM, first-class graduate of the Royal Northern College of Music, and Alvarez Emerging Artist at Garsington Opera.',
    website: 'https://charlottejanekennedy.com',
    instagram: 'https://www.instagram.com/charlottejanekennedy/',
  },
  {
    slug: 'laura-mekhail',
    name: 'Laura Mekhail',
    country: 'Egypt',
    year: 2021,
    type: 'Soprano',
    bio: 'Egyptian soprano. No dedicated personal website. Active on Instagram @lauramekhail_sop.',
    website: null,
    instagram: 'https://www.instagram.com/lauramekhail_sop/',
  },
];
