import axios from 'axios';
import { uploadToS3, listObjectsInS3 } from '../../utils/s3Uploader';

const SPIGET_API_URL = 'https://api.spiget.org/v2/resources';
const HEADERS = {
    'User-Agent': 'MineCDN/1.0 (+https://minecdn.net)'
};

export async function scrapeSpiget() {
    console.log("Starting scrapeSpiget function...");

    let plugins;
    try {
        const response = await axios.get(`${SPIGET_API_URL}?size=500&sort=-downloads&fields=name,id,file,premium`, { headers: HEADERS });
        plugins = response.data;
    } catch (error) {
        console.error(`Failed to fetch plugins list from Spiget. URL: ${SPIGET_API_URL}`, error);
        return;
    }

    const existingFiles = await listObjectsInS3('plugins/');

    for (const plugin of plugins) {
        if (plugin.premium) {
            console.log(`${plugin.name} is a premium resource! Skipping download...`);
            continue;
        }

        const url = `https://api.spiget.org/v2/resources/${plugin.id}/download`;

        const regex = /resources\/(.*?)\.(\d+)\/download\?version=(\d+)/;
        const matches = plugin.file.url.match(regex);

        if (!matches) {
            console.error(`Unexpected URL format for plugin ${plugin.name}. URL: ${plugin.file.url}`);
            continue;
        }

        const [, resourceName, resourceId, version] = matches;
        const fileName = `${resourceName}.${resourceId}-${version}.jar`;
        const fullPath = `plugins/${fileName}`;

        if (existingFiles.includes(fullPath)) {
            console.log(`${fileName} already exists in S3. Skipping download...`);
            continue;
        }

        console.log(`Fetching plugin ${plugin.name} from Spiget...`);

        let pluginContent;
        try {
            pluginContent = await axios.get(url, { responseType: 'arraybuffer', headers: HEADERS });
        } catch (error) {
            console.error(`Failed to fetch plugin ${plugin.name}. URL: ${url}`, error);
            continue;
        }

        await uploadToS3('minecraft-jars/plugins/spigot', fileName, pluginContent.data);
        console.log(`Uploaded plugin ${plugin.name} as ${fileName} to S3.`);
    }
}

scrapeSpiget().catch(err => console.error("scrapeSpiget error:", err));
