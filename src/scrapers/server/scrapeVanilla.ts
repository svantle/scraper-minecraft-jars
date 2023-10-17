import axios from 'axios';
import { uploadToS3, listObjectsInS3 } from '../../utils/s3Uploader';

async function scrapeAllVanillaReleases() {
    console.log("Starting scrapeVanilla function...");

    // Fetch a list of objects from S3 bucket
    const existingFiles = await listObjectsInS3('minecraft-jars/server/vanilla/');

    try {
        // Fetch the manifest JSON
        const manifestResponse = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest.json');

        // Filter only release versions
        const releaseVersions = manifestResponse.data.versions.filter((version: { type: string; }) => version.type === 'release');

        for (const versionData of releaseVersions) {
            const versionId = versionData.id;

            // Fetch the detailed JSON of the current version
            const versionDetailsResponse = await axios.get(versionData.url);
            const serverJarUrl = versionDetailsResponse.data.downloads.server.url;

            const fileName = `minecraft-server-${versionId}.jar`;
            const fullPath = `minecraft-jars/server/vanilla/${fileName}`;

            // Check if the current version exists in the S3 bucket
            if (existingFiles.includes(fullPath)) {
                console.log(`${fileName} already exists in S3. Skipping download...`);
                continue;
            }

            console.log(`Fetching Minecraft Vanilla Server jar for version ${versionId}...`);

            // Fetch the JAR file using the extracted URL
            const jarContent = await axios.get(serverJarUrl, { responseType: 'arraybuffer' });

            await uploadToS3('minecraft-jars/server/vanilla/', fileName, jarContent.data);
            console.log(`Uploaded Minecraft Vanilla Server jar for version ${versionId} to S3.`);
        }
    } catch (error) {
        console.error("Failed to fetch vanilla server jars:", error);
    }
}

scrapeAllVanillaReleases().catch(err => console.error("scrapeVanilla error:", err));
