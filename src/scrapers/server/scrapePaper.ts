import { scrapeProject } from '../../utils/scrapeHelper';

export async function scrapePaper() {
    await scrapeProject('paper', 'https://papermc.io/api/v2/projects/paper');
}

// Error handling
scrapePaper().catch(err => console.error("scrapePaper error:", err));
