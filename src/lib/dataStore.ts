import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface ScrapedEvent {
  id: string;
  artist: string;
  platform: string;
  timeAgo: string;
  content: string;
  engagement: string;
  type: 'News' | 'Performance';
  isNew: boolean;
  dateScraped: string;
}

const FILE_PATH = path.join(process.cwd(), 'data', 'events.json');

export async function getEvents(): Promise<ScrapedEvent[]> {
  try {
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveEvents(events: ScrapedEvent[]) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(events, null, 2));
}

export async function upsertEvents(newEntries: Omit<ScrapedEvent, 'id' | 'isNew' | 'dateScraped'>[]) {
  const existing = await getEvents();
  
  // Mark existing as not new anymore
  const updatedExisting = existing.map(e => ({ ...e, isNew: false }));
  
  const merged = [...updatedExisting];
  let newFound = 0;

  for (const entry of newEntries) {
    // Basic hash to avoid exact duplicates
    const contentHash = crypto.createHash('md5').update(entry.artist + entry.content).digest('hex');
    
    const exists = merged.find(e => crypto.createHash('md5').update(e.artist + e.content).digest('hex') === contentHash);
    
    if (!exists) {
      merged.unshift({
        ...entry,
        id: contentHash,
        isNew: true,
        dateScraped: new Date().toISOString()
      });
      newFound++;
    }
  }

  await saveEvents(merged);
  return { newFound, total: merged.length };
}
