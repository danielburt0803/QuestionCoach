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

async function getProject(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireUser(request);
    const id = request.params['id'];
    const container = getProjectsContainer();
    const { resource } = await container.item(id, user.userId).read<any>();
    if (!resource || resource.userId !== user.userId) return { status: 404, jsonBody: { error: 'Not found' } };
    return { status: 200, jsonBody: migrateProject(resource) };
  } catch (err) {
    if (err instanceof AuthError) return { status: 401, jsonBody: { error: 'Unauthenticated' } };
    context.error('getProject error', err);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

async function updateProject(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireUser(request);
    const id = request.params['id'];
    const container = getProjectsContainer();

    const { resource: raw } = await container.item(id, user.userId).read<any>();
    if (!raw || raw.userId !== user.userId) return { status: 404, jsonBody: { error: 'Not found' } };

    const existing = migrateProject(raw);
    const body = await request.json() as Partial<Project>;
    const updated: Project = {
      ...existing,
      name: body.name !== undefined ? String(body.name).slice(0, 200) : existing.name,
      departments: body.departments ?? existing.departments,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await container.item(id, user.userId).replace(updated);
    return { status: 200, jsonBody: resource };
  } catch (err) {
    if (err instanceof AuthError) return { status: 401, jsonBody: { error: 'Unauthenticated' } };
    context.error('updateProject error', err);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

async function deleteProject(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireUser(request);
    const id = request.params['id'];
    const container = getProjectsContainer();

    const { resource: existing } = await container.item(id, user.userId).read<Project>();
    if (!existing || existing.userId !== user.userId) return { status: 404, jsonBody: { error: 'Not found' } };

    await container.item(id, user.userId).delete();
    return { status: 204 };
  } catch (err) {
    if (err instanceof AuthError) return { status: 401, jsonBody: { error: 'Unauthenticated' } };
    context.error('deleteProject error', err);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

app.http('projectsById', {
  methods: ['GET', 'PUT', 'DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{id}',
  handler: async (request, context) => {
    if (request.method === 'GET') return getProject(request, context);
    if (request.method === 'PUT') return updateProject(request, context);
    return deleteProject(request, context);
  },
});
