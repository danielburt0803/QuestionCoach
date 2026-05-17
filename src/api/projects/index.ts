import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { getProjectsContainer } from '../lib/cosmos';
import { requireUser, AuthError } from '../lib/auth';
import { Project } from '../types';

async function listProjects(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireUser(request);
    const container = getProjectsContainer();
    const { resources } = await container.items
      .query<Project>({
        query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.updatedAt DESC',
        parameters: [{ name: '@userId', value: user.userId }],
      })
      .fetchAll();
    return { status: 200, jsonBody: resources };
  } catch (err) {
    if (err instanceof AuthError) return { status: 401, jsonBody: { error: 'Unauthenticated' } };
    context.error('listProjects error', err);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

async function createProject(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireUser(request);
    const body = await request.json() as Partial<Project>;

    const project: Project = {
      id: uuidv4(),
      userId: user.userId,
      name: String(body.name ?? 'New Project').slice(0, 200),
      filters: body.filters ?? { product: null, area: null, subArea: null },
      progress: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const container = getProjectsContainer();
    const { resource } = await container.items.create(project);
    return { status: 201, jsonBody: resource };
  } catch (err) {
    if (err instanceof AuthError) return { status: 401, jsonBody: { error: 'Unauthenticated' } };
    context.error('createProject error', err);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

app.http('projects', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: async (request, context) => {
    if (request.method === 'GET') return listProjects(request, context);
    return createProject(request, context);
  },
});
