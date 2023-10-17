import { scrapeProject } from '../../utils/scrapeHelper';

export async function scrapeWaterfall() {
    await scrapeProject('waterfall', 'https://papermc.io/api/v2/projects/waterfall');
}

// Error handling
scrapeWaterfall().catch(err => console.error("scrapeWaterfall error:", err));
