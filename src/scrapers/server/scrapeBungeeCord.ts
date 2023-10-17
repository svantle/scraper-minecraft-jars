import axios from 'axios';
import { uploadToS3, listObjectsInS3 } from '../../utils/s3Uploader';

const BUNGEECORD_JENKINS_API_URL = 'https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/api/json';
const BUNGEECORD_JENKINS_ARTIFACT_URL = 'https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/artifact/bootstrap/target/BungeeCord.jar';

export async function scrapeBungeeCord() {
    console.log("Starting scrapeBungeeCord function...");

    let buildNumber: string;
    try {
        const jenkinsApiResponse = await axios.get(BUNGEECORD_JENKINS_API_URL);
        buildNumber = jenkinsApiResponse.data.number;
    } catch (error) {
        console.error(`Failed to fetch build number from Jenkins. URL: ${BUNGEECORD_JENKINS_API_URL}`);
        return;
    }

    const fileName = `bungeecord-${buildNumber}.jar`;
    const fullPath = `server/bungeecord/${fileName}`;

    // Fetch a list of objects from S3 bucket
    const existingFiles = await listObjectsInS3('server/bungeecord/');

    // Check if the current version exists in the S3 bucket
    if (existingFiles.includes(fullPath)) {
        console.log(`${fileName} already exists in S3. Skipping download...`);
        return;
    }

    console.log(`Fetching BungeeCord build #${buildNumber} from Jenkins...`);

    let jarContent;
    try {
        jarContent = await axios.get(BUNGEECORD_JENKINS_ARTIFACT_URL, { responseType: 'arraybuffer' });
    } catch (error) {
        console.error(`Failed to fetch BungeeCord build #${buildNumber}. URL: ${BUNGEECORD_JENKINS_ARTIFACT_URL}`);
        return;
    }

    await uploadToS3('minecraft-jars/server/bungeecord/', fileName, jarContent.data);
    console.log(`Uploaded BungeeCord build #${buildNumber} to S3.`);
}

scrapeBungeeCord().catch(err => console.error("scrapeBungeeCord error:", err));
