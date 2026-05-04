import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ARTISTS, getAllEvents } from '@/lib/events';

export default async function ArtistDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = ARTISTS.find(a => a.slug === slug);
  if (!artist) notFound();

  const allEvents = getAllEvents();
  const artistEvents = allEvents.filter(e => e.artist === artist.name);

  return (
    <div className="min-h-screen bg-aria-bg text-aria-text-main">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <Link href="/artists" className="text-aria-gold hover:underline text-sm mb-6 inline-block">← Back to Artists  </Link>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-white">
            {artist.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-aria-gold">{artist.name}</h1>
            <p className="text-aria-text-muted">{artist.type} — {artist.country}, Scholar {artist.year}</p>
            <div className="flex flex-col gap-1 mt-1">
              {artist.website && (
                <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-sm text-aria-gold hover:underline inline-block">🌐 {artist.website}</a>
              )}
              {artist.instagram && (
                <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-aria-gold hover:underline inline-block">
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle'}}>
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                    </svg>
                    {artist.instagram}
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>

        <p className="text-aria-text-muted mb-8 leading-relaxed">{artist.bio}</p>

        <h2 className="text-2xl font-bold text-aria-gold mb-4">Events ({artistEvents.length})</h2>
        {artistEvents.length === 0 ? (
          <p className="text-aria-text-muted italic">No events scraped for this artist.</p>
        ) : (
          <div className="space-y-4">
            {artistEvents.map(ev => (
              <div key={ev.id} className="bg-aria-card border border-slate-700/50 rounded-xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{ev.title}</h3>
                  <span className="text-xs text-aria-text-muted">{ev.rawDate}</span>
                </div>
                <p className="text-sm text-aria-text-muted whitespace-pre-line">{ev.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
