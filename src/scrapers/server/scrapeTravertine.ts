import { scrapeProject } from '../../utils/scrapeHelper';

export async function scrapeTravertine() {
    await scrapeProject('travertine', 'https://papermc.io/api/v2/projects/travertine');
}

// Error handling
scrapeTravertine().catch(err => console.error("scrapeTravertine error:", err));
