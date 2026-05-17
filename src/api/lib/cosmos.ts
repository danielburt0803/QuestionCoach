import { CosmosClient, Container } from '@azure/cosmos';

let container: Container | null = null;

export function getProjectsContainer(): Container {
  if (container) return container;

  const connectionString = process.env.COSMOS_CONNECTION_STRING;
  if (!connectionString) throw new Error('COSMOS_CONNECTION_STRING must be set');

  const client = new CosmosClient(connectionString);
  container = client.database('QuestionCoach').container('projects');
  return container;
}
