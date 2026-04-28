'use client';
import React, { useState, useMemo } from 'react';
import { getAllEvents, ARTISTS, NormalizedEvent } from '@/lib/events';
import Link from 'next/link';

const ARTIST_NAMES = ['Clara Barbier Serrano', 'Seonwoo Lee', 'Anastasia Koorn', 'Henna Mun', 'Charlotte Jane Kennedy'];

export default function Dashboard() {
  const allEvents = useMemo(() => getAllEvents(), []);
  const [filters, setFilters] = useState<Record<string, boolean>>(
    Object.fromEntries(ARTIST_NAMES.map(n => [n, true]))
  );
//rr
  const toggleFilter = (name: string) => {
    setFilters(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const filtered = allEvents.filter(ev => filters[ev.artist]);

  // Per-artist next 4 upcoming events
  const now = Date.now();
  const upcomingByArtist = useMemo(() => {
    const map: Record<string, NormalizedEvent[]> = {};
    for (const name of ARTIST_NAMES) {
      map[name] = allEvents.filter(e => e.artist === name && e.sortDate >= now).slice(0, 4);
    }
    return map;
  }, [allEvents]);

  return (
    <div className="min-h-screen flex bg-aria-bg">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 bg-aria-panel h-screen flex flex-col pt-8 px-4 fixed left-0 top-0 overflow-y-auto">
        <div className="mb-10 pl-2">
          <h1 className="text-3xl font-bold text-aria-gold tracking-wide">Aria</h1>
          <p className="text-xs text-aria-text-muted tracking-widest uppercase mt-1">Artist Intelligence</p>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg text-aria-gold font-medium">Feed</Link>
            </li>
            <li>
              <Link href="/artists" className="flex items-center gap-3 px-4 py-3 text-aria-text-muted hover:text-white transition-colors">Artists</Link>
            </li>
          </ul>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="font-semibold text-sm text-aria-text-main px-2 block mb-4">Target Websites</span>
            <ul className="space-y-3 px-2 text-sm text-aria-text-muted">
              {ARTIST_NAMES.map(name => (
                <li key={name} className="flex items-center gap-3 cursor-pointer" onClick={() => toggleFilter(name)}>
                  <input type="checkbox" checked={filters[name]} readOnly className="accent-aria-gold rounded h-4 w-4 cursor-pointer" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      {/* MAIN FEED */}
      <main className="flex-1 ml-64 mr-80 pl-8 pr-4 pt-8 pb-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-1 text-aria-gold">Artist Feed</h2>
          <p className="text-aria-text-muted">{filtered.length} events sorted by date</p>
        </div>

        <div className="flex flex-col gap-5 max-w-3xl">
          {filtered.map((post) => {
            const isFuture = post.sortDate >= now;
            return (
              <div key={post.id} className="bg-aria-card border border-slate-700/50 rounded-xl p-5 shadow-lg relative transition-all hover:border-slate-600">
                {isFuture && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-md">Upcoming</span>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white shadow-inner">
                      {post.artist.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-aria-text-main">{post.artist}</h3>
                      <p className="text-xs text-aria-text-muted font-medium">{post.rawDate}</p>
                    </div>
                  </div>
                  <span className="bg-slate-700 text-white text-xs px-3 py-1 rounded-full font-medium">{post.platform}</span>
                </div>
                <p className="text-aria-text-main mb-4 leading-relaxed whitespace-pre-line text-sm">{post.detail}</p>
                <div className="flex justify-between items-center text-sm text-aria-text-muted border-t border-slate-700/50 pt-4">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-aria-gold"></span>
                    {post.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* RIGHT PANEL — Next 4 events per artist */}
      <aside className="w-80 border-l border-slate-800 bg-aria-panel h-screen fixed right-0 top-0 overflow-y-auto pt-8 px-6">
        <h2 className="text-xl font-bold text-aria-gold mb-6">Upcoming Performances</h2>
        {ARTIST_NAMES.map(name => {
          const upcoming = upcomingByArtist[name];
          if (!upcoming || upcoming.length === 0) return (
            <div key={name} className="mb-6">
              <h3 className="font-semibold text-aria-text-main text-sm mb-2">{name}</h3>
              <p className="text-xs text-aria-text-muted italic">No upcoming events</p>
            </div>
          );
          return (
            <div key={name} className="mb-6">
              <h3 className="font-semibold text-aria-text-main text-sm mb-3">{name}</h3>
              <div className="space-y-3">
                {upcoming.map(ev => (
                  <div key={ev.id} className="bg-aria-card border border-slate-700/50 rounded-lg p-3 text-xs">
                    <h4 className="font-bold text-aria-text-main mb-1">{ev.title}</h4>
                    <p className="text-aria-text-muted">📅 {ev.rawDate}</p>
                    {ev.venue && <p className="text-aria-text-muted">📍 {ev.venue}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </aside>
    </div>
  );
}
