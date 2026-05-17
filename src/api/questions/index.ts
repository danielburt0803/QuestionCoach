import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import { Question } from '../types';

let cachedQuestions: Question[] | null = null;

async function fetchQuestions(): Promise<Question[]> {
  if (cachedQuestions) return cachedQuestions;

  const connectionString = process.env.BLOB_CONNECTION_STRING;
  const blobUrl = process.env.QUESTIONS_BLOB_URL;

  if (!connectionString || !blobUrl) {
    throw new Error('BLOB_CONNECTION_STRING and QUESTIONS_BLOB_URL must be set');
  }

  const url = new URL(blobUrl);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const containerName = pathParts[0];
  const blobName = pathParts.slice(1).join('/') || 'questions.json';

  const blobClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobClient.getContainerClient(containerName);
  const blob = containerClient.getBlobClient(blobName);
  const download = await blob.downloadToBuffer();
  cachedQuestions = JSON.parse(download.toString('utf-8')) as Question[];
  return cachedQuestions;
}

async function getQuestions(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const questions = await fetchQuestions();
    return {
      status: 200,
      jsonBody: questions,
      headers: { 'Cache-Control': 'public, max-age=300' },
    };
  } catch (err) {
    context.error('Failed to fetch questions', err);
    return { status: 500, jsonBody: { error: 'Failed to load questions' } };
  }
}

app.http('questions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'questions',
  handler: getQuestions,
});
