'use client';
import React from 'react';
import claraEvents from '@/data/clara-events.json';
import seonwooEvents from '@/data/seonwoo-events.json';
import anastasiaEvents from '@/data/anastasia-events.json';
import hennaEvents from '@/data/henna-events.json';

export default function SocialFeed() {
  const claraPosts = claraEvents.map((ev: any, index: number) => ({
    id: `clara-${index}`,
    artist: 'Clara Barbier Serrano',
    platform: 'Website',
    timeAgo: ev.rawDate || 'Upcoming',
    content: `${ev.title}${ev.venue ? `\n📍 ${ev.venue}` : ''}${ev.rawTime ? `\n🕒 ${ev.rawTime}` : ''}${ev.description ? `\n\n${ev.description}` : ''}`,
    engagement: 'Confirmed',
    type: 'Performance',
    isNew: false
  }));

  const seonwooPosts = seonwooEvents.map((ev: any, index: number) => ({
    id: `seonwoo-${index}`,
    artist: 'Seonwoo Lee',
    platform: 'Wix Calendar',
    timeAgo: ev.rawDate || 'Upcoming',
    content: `${ev.title}${ev.composer ? `\n🎵 ${ev.composer}` : ''}${ev.venue ? `\n📍 ${ev.venue}` : ''}${ev.role ? `\n🎭 ${ev.role}` : ''}${ev.conductor ? `\n🎼 Conductor: ${ev.conductor}` : ''}${ev.director ? `\n🎬 Director: ${ev.director}` : ''}`,
    engagement: ev.season || 'Performance',
    type: 'Schedule',
    isNew: false
  }));

  const anastasiaPosts = anastasiaEvents.map((ev: any, index: number) => ({
    id: `anastasia-${index}`,
    artist: 'Anastasia Koorn',
    platform: 'Squarespace Events',
    timeAgo: ev.rawDate || ev.startDate?.substring(0, 10) || 'Upcoming',
    content: `${ev.title}${ev.venue ? `\n📍 ${ev.venue}` : ''}${ev.address ? `\n🗺️ ${ev.address}` : ''}${ev.description ? `\n\n${ev.description}` : ''}`,
    engagement: 'Performance',
    type: 'Calendar Event',
    isNew: index === 0
  }));

  const hennaPosts = hennaEvents.map((ev: any, index: number) => ({
    id: `henna-${index}`,
    artist: 'Henna Mun',
    platform: 'Squarespace Events',
    timeAgo: ev.rawDate || ev.startDate?.substring(0, 10) || 'Upcoming',
    content: `${ev.title}${ev.venue ? `\n📍 ${ev.venue}` : ''}${ev.role ? `\n🎭 Role: ${ev.role}` : ''}${ev.companyOrPresenter ? `\n🏛️ ${ev.companyOrPresenter}` : ''}${ev.description ? `\n\n${ev.description}` : ''}`,
    engagement: 'Performance',
    type: 'Calendar Event',
    isNew: index === 0
  }));

  const posts = [...hennaPosts, ...anastasiaPosts, ...seonwooPosts, ...claraPosts];

  return (
    <div className="flex-1 ml-64 pl-8 pr-4 pt-8 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-1 text-aria-gold">Artist Feed</h2>
          <p className="text-aria-text-muted">{posts.length} events (Clara, Seonwoo, Anastasia & Henna)</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 max-w-3xl">
        {posts.map((post) => (
          <div key={post.id} className="bg-aria-card border border-slate-700/50 rounded-xl p-5 shadow-lg relative transition-all hover:border-slate-600">
            {post.isNew && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full animate-pulse shadow-md">LATEST</span>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white overflow-hidden shadow-inner">
                  {post.artist.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-aria-text-main">{post.artist}</h3>
                  <p className="text-xs text-aria-text-muted font-medium">{post.timeAgo}</p>
                </div>
              </div>
              <span className="bg-slate-700 text-white text-xs px-3 py-1 rounded-full font-medium">
                {post.platform}
              </span>
            </div>
            
            <p className="text-aria-text-main mb-4 leading-relaxed whitespace-pre-line text-sm">
              {post.content}
            </p>
            
            <div className="flex justify-between items-center text-sm text-aria-text-muted border-t border-slate-700/50 pt-4">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-aria-gold"></span>
                  {post.type}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-aria-panel border border-slate-700 text-xs font-semibold text-aria-gold">
                {post.engagement}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
