import { BlobServiceClient } from '@azure/storage-blob';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const connectionString = process.env.BLOB_CONNECTION_STRING;
const blobUrl = process.env.QUESTIONS_BLOB_URL;

if (!connectionString || !blobUrl) {
  console.error('Set BLOB_CONNECTION_STRING and QUESTIONS_BLOB_URL env vars first.');
  process.exit(1);
}

const data = readFileSync(join(root, 'data', 'questions.json'));
const questions = JSON.parse(data.toString());
console.log(`Uploading ${questions.length} questions...`);
const products = [...new Set(questions.map(q => q.product))];
console.log('Products:', products);

const url = new URL(blobUrl);
const pathParts = url.pathname.split('/').filter(Boolean);
const containerName = pathParts[0];
const blobName = pathParts.slice(1).join('/');

const client = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = client.getContainerClient(containerName);
const blobClient = containerClient.getBlockBlobClient(blobName);

await blobClient.upload(data, data.length, {
  blobHTTPHeaders: { blobContentType: 'application/json' },
});

console.log(`Uploaded to ${blobUrl}`);
