import { runScraper } from '../src/lib/scraper';

async function main() {
  console.log('Running scraper script manually...');
  const result = await runScraper();
  console.log('Finished:', result);
}

main().catch(console.error);
