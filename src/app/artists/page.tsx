import Link from 'next/link';
import { ARTISTS } from '@/lib/events';

export default function ArtistsPage() {
  return (
    <div className="min-h-screen bg-aria-bg text-aria-text-main">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <Link href="/" className="text-aria-gold hover:underline text-sm mb-6 inline-block">← Back to Feed</Link>
        <h1 className="text-4xl font-bold text-aria-gold mb-8">Artists</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARTISTS.map(artist => (
            <Link key={artist.slug} href={`/artists/${artist.slug}`}
              className="bg-aria-card border border-slate-700/50 rounded-xl p-6 hover:border-aria-gold transition-colors block">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-xl font-bold text-white">
                  {artist.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{artist.name}</h2>
                  <p className="text-sm text-aria-gold">{artist.type}</p>
                </div>
              </div>
              <p className="text-sm text-aria-text-muted mb-2">{artist.country} — Scholar {artist.year}</p>
              <p className="text-sm text-aria-text-muted line-clamp-2">{artist.bio}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
