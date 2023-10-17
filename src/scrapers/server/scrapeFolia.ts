import { scrapeProject } from '../../utils/scrapeHelper';

export async function scrapeFolia() {
    await scrapeProject('folia', 'https://papermc.io/api/v2/projects/folia');
}

// Error handling
scrapeFolia().catch(err => console.error("scrapeFolia error:", err));
