# Question Coach — Project Memory

Last updated: 2026-05-17

## What This App Does

A web app for Functional Consultants and Solution Architects facilitating Dynamics 365 Contact Center / Customer Service requirements-gathering workshops. It serves a structured question checklist, filtered by Product/Area/Sub-Area, with per-project progress tracking and notes.

---

## Current State

| Phase | Status |
|---|---|
| Data conversion (Excel → JSON) | Done — `data/questions.json` (41 questions) |
| Bicep infrastructure | Done — `infra/main.bicep` + 3 modules |
| `staticwebapp.config.json` | Done |
| `build.md` | Done |
| Azure Functions API | Done — questions + projects CRUD |
| React frontend | Done — builds successfully |
| Azure deployment | Done — see Azure Portal for resource details |
| GitHub Actions CI/CD | Done — pushes to main auto-deploy |

---

## Architecture Summary

| Layer | Choice |
|---|---|
| Hosting | Azure Static Web App (Standard tier) |
| Frontend | React 18 + TypeScript + Vite + Fluent UI React v9 |
| API | Azure Functions (SWA integrated), Node.js v4 model |
| Auth | **Disabled for prototype** — anonymous access, fixed userId in API |
| Projects DB | Azure Cosmos DB (Serverless), db `QuestionCoach`, container `projects`, partition key `/userId` |
| Question data | Azure Blob Storage, container `questions`, file `questions.json` |
| State | TanStack Query |
| Export | SheetJS (client-side xlsx) |
| IaC | Bicep (`infra/main.bicep` + 3 modules) |
| CI/CD | GitHub Actions → `.github/workflows/deploy.yml` |

---

## Key Data Models

### Question (from Blob Storage)
```typescript
{
  id: string;          // UUID
  product: string;     // e.g. "Dynamics 365 Customer Service"
  area: string;        // e.g. "Email", "Knowledge"
  subArea: string;     // e.g. "Attachment", "Copilot"
  question: string;
  reference: string;   // MS Learn link or article title
}
```

### Project (Cosmos DB)
```typescript
{
  id: string;
  userId: string;      // "prototype-user" (fixed while auth is disabled)
  name: string;
  filters: { product: string | null; area: string | null; subArea: string | null; };
  progress: { [questionId: string]: { status: 'not-started'|'asked'|'answered'|'skipped'; notes: string; } };
  createdAt: string;
  updatedAt: string;
}
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/questions` | Returns full questions array from Blob Storage |
| GET | `/api/projects` | Returns all projects for the fixed prototype user |
| POST | `/api/projects` | Creates a project |
| GET | `/api/projects/{id}` | Gets one project |
| PUT | `/api/projects/{id}` | Updates project (filters, progress, notes) |
| DELETE | `/api/projects/{id}` | Deletes a project |

---

## Environment Variables (Azure Functions App Settings)

These are set in the Azure Portal / SWA App Settings. **Never commit their values.**

| Variable | Purpose |
|---|---|
| `COSMOS_CONNECTION_STRING` | Cosmos DB connection string |
| `BLOB_CONNECTION_STRING` | Storage account connection string |
| `QUESTIONS_BLOB_URL` | Full URL to questions.json blob |
| `AAD_CLIENT_ID` | Entra ID app registration client ID (for future auth) |
| `AAD_CLIENT_SECRET` | Entra ID app registration client secret (for future auth) |

---

## Important File Locations

| File | Purpose |
|---|---|
| `data/questions.json` | Question data (41 questions, converted from Excel) |
| `scripts/convert-excel.mjs` | Re-convert Excel → JSON when data is updated |
| `infra/main.bicep` | Deploys all Azure resources |
| `src/api/lib/auth.ts` | Auth helper — returns fixed user while auth is disabled |
| `src/app/src/App.tsx` | App entry — skips login while auth is disabled |
| `staticwebapp.config.json` | SWA routing, API runtime declaration |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD pipeline |
| `build.md` | Architecture and decision log |

---

## Question Data

- **Source**: `OOTB Requirements Checklist .xlsx` (Sheet: `Scoping Questions`)
- **Count**: 41 questions
- **Products**: Dynamics 365 Customer Service only
- **Areas**: Email, Knowledge
- **To update**: Edit the Excel, run `node scripts/convert-excel.mjs`, upload the new `data/questions.json` to the Blob Storage `questions` container in the Azure Portal.

---

## Deployment

CI/CD is via GitHub Actions — pushing to `main` triggers an automatic build and deploy (~2 minutes). The deployment token is stored as a GitHub Actions secret and **must never be committed to this repo**.

For Azure resource details (subscription, resource names, connection strings), refer to the Azure Portal. These must not be stored in this file.

---

## Next Steps

- [ ] Re-enable authentication (Entra ID) once the sign-in loop is debugged
- [ ] Add Dynamics 365 Contact Center questions to the Excel and re-import
- [ ] Consider code-splitting to reduce 935 KB frontend bundle
- [ ] Fix question ID stability: use a content hash instead of random UUID so re-importing Excel preserves project progress mapping
