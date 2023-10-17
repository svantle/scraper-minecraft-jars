import { scrapeProject } from '../../utils/scrapeHelper';

export async function scrapeVelocity() {
    await scrapeProject('velocity', 'https://papermc.io/api/v2/projects/velocity');
}

// Error handling
scrapeVelocity().catch(err => console.error("scrapeVelocity error:", err));
