import React from 'react';

export default function RightPanel() {
  return (
    <aside className="w-80 border-l border-slate-800 bg-aria-panel h-screen flex flex-col pt-8 px-6 fixed right-0 top-0 overflow-y-auto">
      <div className="mb-10">
        <h2 className="text-xl font-bold text-aria-gold mb-4">Featured Artist</h2>
        <div className="bg-aria-card border border-slate-700/50 rounded-xl overflow-hidden shadow-lg">
          <div className="h-40 bg-slate-700 bg-[url('https://images.unsplash.com/photo-1516281329241-11b7ed4b46e3?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
          <div className="p-4">
            <h3 className="font-bold text-lg">Sabine Devieilhe</h3>
            <p className="text-aria-gold text-sm font-medium mb-3">Soprano</p>
            <p className="text-sm text-aria-text-muted leading-relaxed">
              Leading French-American soprano specializing in baroque and classical repertoire.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-aria-gold mb-4">Upcoming Performances</h2>
        <div className="space-y-4">
          <div className="bg-aria-card border border-slate-700/50 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold">Così fan tutte</h4>
              <span className="bg-slate-700/50 text-xs px-2 py-1 rounded border border-slate-600 text-aria-text-muted">Confirmed</span>
            </div>
            <p className="text-sm text-aria-text-muted mb-1 flex items-center gap-2">
              <span>📅</span> Jan 15, 2025
            </p>
            <p className="text-sm text-aria-text-muted flex items-center gap-2 mb-2">
              <span>📍</span> Opéra Garnier
            </p>
            <p className="text-sm text-aria-gold font-medium">Fiordiligi</p>
          </div>

          <div className="bg-aria-card border border-slate-700/50 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold">Rigoletto Gala</h4>
              <span className="bg-slate-700/50 text-xs px-2 py-1 rounded border border-slate-600 text-aria-text-muted">Confirmed</span>
            </div>
            <p className="text-sm text-aria-text-muted mb-1 flex items-center gap-2">
              <span>📅</span> Feb 20, 2025
            </p>
            <p className="text-sm text-aria-text-muted flex items-center gap-2 mb-2">
              <span>📍</span> La Scala, Milan
            </p>
            <p className="text-sm text-aria-gold font-medium">Duke of Mantua</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
