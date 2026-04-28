'use client';
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function ScrapeButton() {
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    setLoading(true);
    try {
      // Intentionally calling an API route we will build next
      const res = await fetch('/api/scrape', { method: 'POST' });
      if (res.ok) {
        // Trigger a refresh or pass down an event to refetch data
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to scrape', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleScrape}
      disabled={loading}
      className={`flex items-center gap-2 bg-aria-gold hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-all ${
        loading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
      {loading ? 'Scraping...' : 'Scrape Updates'}
    </button>
  );
}
