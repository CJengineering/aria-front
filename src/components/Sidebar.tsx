import React from 'react';
import { LayoutDashboard, Users, Calendar, BarChart2, Filter } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-aria-panel h-screen flex flex-col pt-8 px-4 fixed left-0 top-0">
      <div className="mb-10 pl-2">
        <h1 className="text-3xl font-bold text-aria-gold tracking-wide">Aria</h1>
        <p className="text-xs text-aria-text-muted tracking-widest uppercase mt-1">Artist Intelligence</p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg text-aria-gold font-medium">
              <LayoutDashboard size={18} />
              Feed
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-aria-text-muted hover:text-white transition-colors">
              <Users size={18} />
              Artists
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-aria-text-muted hover:text-white transition-colors">
              <Calendar size={18} />
              Concerts
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-aria-text-muted hover:text-white transition-colors">
              <BarChart2 size={18} />
              Insights
            </a>
          </li>
        </ul>

        {/* Mock Filters area */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between px-2 mb-4 cursor-pointer text-aria-text-main">
            <span className="font-semibold text-sm">Target Websites</span>
          </div>
          <ul className="space-y-3 px-2 text-sm text-aria-text-muted">
            <li className="flex items-center gap-3">
              <input type="checkbox" checked readOnly className="accent-aria-gold rounded h-4 w-4" />
              Clara Barbier Serrano
            </li>
            <li className="flex items-center gap-3">
              <input type="checkbox" checked readOnly className="accent-aria-gold rounded h-4 w-4" />
              Seonwoo Lee
            </li>
            <li className="flex items-center gap-3">
              <input type="checkbox" checked readOnly className="accent-aria-gold rounded h-4 w-4" />
              Anastasia Koorn
            </li>
            <li className="flex items-center gap-3">
              <input type="checkbox" checked readOnly className="accent-aria-gold rounded h-4 w-4" />
              Charlotte Jane Kennedy
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
