import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { getProjectsContainer } from '../lib/cosmos';
import { requireUser, AuthError } from '../lib/auth';
import { Project } from '../types';

function migrateProject(doc: any): Project {
  if (Array.isArray(doc.departments)) return doc as Project;
  return {
    id: doc.id,
    userId: doc.userId,
    name: doc.name,
    departments: [{
      id: uuidv4(),
      name: 'Default',
      filters: {
        products: doc.filters?.product ? [doc.filters.product] : [],
        areas: doc.filters?.area ? [doc.filters.area] : [],
        subAreas: doc.filters?.subArea ? [doc.filters.subArea] : [],
        statuses: [],
      },
      progress: doc.progress ?? {},
      createdAt: doc.createdAt,
    }],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function listProjects(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireUser(request);
    const container = getProjectsContainer();
    const { resources } = await container.items
      .query<any>({
        query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.updatedAt DESC',
        parameters: [{ name: '@userId', value: user.userId }],
      })
      .fetchAll();
    return { status: 200, jsonBody: resources.map(migrateProject) };
  } catch (err) {
    if (err instanceof AuthError) return { status: 401, jsonBody: { error: 'Unauthenticated' } };
    context.error('listProjects error', err);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

async function createProject(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireUser(request);
    const body = await request.json() as Partial<{ name: string }>;

    const now = new Date().toISOString();
    const project: Project = {
      id: uuidv4(),
      userId: user.userId,
      name: String(body.name ?? 'New Project').slice(0, 200),
      departments: [{
        id: uuidv4(),
        name: 'Default',
        filters: { products: [], areas: [], subAreas: [], statuses: [] },
        progress: {},
        createdAt: now,
      }],
      createdAt: now,
      updatedAt: now,
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
