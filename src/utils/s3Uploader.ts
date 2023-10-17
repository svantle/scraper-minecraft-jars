import S3  from 'aws-sdk/clients/s3.js';
import * as dotenv from 'dotenv';

dotenv.config();

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
const s3 = new S3({
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

export async function listObjectsInS3(prefix: string): Promise<(string | undefined)[]> {
    const result = await s3.listObjectsV2({
        Bucket: S3_BUCKET_NAME,
        Prefix: prefix
    }).promise();

    return result.Contents ? result.Contents.map(obj => obj.Key) : [];
}

export async function uploadToS3(path: string, filename: string, content: Buffer) {
    return s3.putObject({
        Bucket: S3_BUCKET_NAME,
        Key: `${path}${filename}`,
        Body: content
    }).promise();
}
