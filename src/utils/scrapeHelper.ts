import axios from 'axios';
import { uploadToS3, listObjectsInS3 } from './s3Uploader';

export async function scrapeProject(projectName: string, apiUrl: string) {
    console.log(`Starting scrape${projectName.charAt(0).toUpperCase() + projectName.slice(1)} function...`);

    // Fetch a list of objects from S3 bucket
    const existingFiles = await listObjectsInS3(`minecraft-jars/server/${projectName}/`);

    const versions: string[] = (await axios.get(apiUrl)).data.versions;

    for (const version of versions) {
        console.log(`Processing ${projectName} version ${version}...`);

        const buildsResponse = await axios.get(`${apiUrl}/versions/${version}`);
        const builds: number[] = buildsResponse.data.builds;

        if (!Array.isArray(builds) || builds.length === 0) {
            console.error(`Invalid builds data for version ${version}. Expected an array but received ${typeof builds}.`);
            continue;
        }

        // Getting the latest build for the version
        const latestBuild = builds[builds.length - 1];

        const fileName = `${projectName}-${version}-${latestBuild}.jar`;
        const fullPath = `minecraft-jars/server/${projectName}/${fileName}`;

        // Check if the current version exists in the S3 bucket
        if (existingFiles.includes(fullPath)) {
            console.log(`${fileName} already exists in S3. Skipping download...`);
            continue;
        }

        console.log(`New version detected! Processing ${projectName} ${version} build ${latestBuild}...`);

        const downloadURL = `${apiUrl}/versions/${version}/builds/${latestBuild}/downloads/${fileName}`;

        let jarContent;
        try {
            jarContent = await axios.get(downloadURL, { responseType: 'arraybuffer' });
        } catch (error) {
            console.error(`Failed to fetch build ${latestBuild} for version ${version}. URL: ${downloadURL}`);
            continue;
        }

        await uploadToS3(`minecraft-jars/server/${projectName}/`, fileName, jarContent.data);
        console.log(`Uploaded ${projectName} ${version} build ${latestBuild} to S3.`);
    }
}
