# Question Coach — Build Decisions

## Architecture Decisions

### Hosting: Azure Static Web App (SWA)
Mandated by requirements. SWA provides integrated CI/CD, globally distributed CDN hosting, and a built-in managed API layer via Azure Functions — all with no separate App Service or API Management needed.

### Frontend: React 18 + TypeScript + Vite
- **React**: Mature ecosystem, large community, strong fit with Fluent UI
- **TypeScript**: Catch data shape mismatches early (especially important given the evolving data model)
- **Vite**: Significantly faster dev server and build than CRA; native ESM

### UI Design System: Fluent UI React v9
Chosen because this app is a companion to Dynamics 365, which uses Fluent design. Consultants already familiar with Microsoft products will find the UI instantly familiar. Fluent UI v9 is the current stable generation (component-level tree-shaking, better accessibility than v8).

### API: Azure Functions (SWA Integrated)
SWA natively hosts Azure Functions in the `/api` path with zero extra infrastructure. The v4 Node.js programming model uses a flat file structure and named exports — simpler than the v3 function.json approach.

### Authentication: SWA Built-in Auth → Entra ID (Azure AD)
SWA has first-class support for Entra ID. The `/.auth/me` endpoint returns user claims without any custom auth middleware. This gives us user identity for project ownership at zero infrastructure cost. All `/api/*` routes are protected at the SWA routing layer.

### Project Storage: Azure Cosmos DB (Serverless, NoSQL)
- **Serverless tier**: Low cost for a prototype with variable usage; billed per request unit, not per provisioned throughput
- **NoSQL**: The `progress` map (keyed by questionId) is naturally schemaless — adding new fields (e.g., confidence score) requires no schema migration
- **Partition key `/userId`**: Ensures all projects for a user are co-located; queries for a user's projects never do cross-partition fan-out
- **Dataverse path**: The data access is fully isolated in one Azure Function. When moving to Dataverse, only that function changes.

### Question Data: Azure Blob Storage (Public Blob)
- Simple to update: upload a new `questions.json` to replace the dataset, no code change required
- Public blob: The questions data is not sensitive; the API function reads it via the SDK on each cold start (cached in memory for warm requests)
- **Dataverse migration (v2)**: Replace the Blob Storage read with a Dataverse Web API call in the `GET /api/questions` function. No frontend changes needed.

### State Management: TanStack Query (React Query)
Provides caching, background re-fetching, loading/error states, and optimistic updates out of the box. Eliminates boilerplate that would otherwise be needed for the debounced auto-save pattern on question notes.

### Export: SheetJS (xlsx)
Client-side Excel generation — no server round-trip for export. The library is run entirely in the browser, keeping the API simple.

**Security note**: SheetJS CE (`xlsx` npm package) has known prototype pollution CVEs with no upstream fix. The risk is acceptable here because we only use the library to *generate* exports from our own in-memory data, never to *parse* untrusted Excel files from users. If file parsing is ever added, switch to a server-side approach.

---

## Infrastructure Decisions

### Bicep over ARM
Bicep is Microsoft's first-class IaC DSL for Azure. It compiles to ARM JSON, is supported by the official VS Code extension, and is significantly more readable than raw ARM.

### Cosmos DB Serverless (not Provisioned Throughput)
For a prototype, serverless avoids paying for unused capacity. When load is predictable and sustained, migrate to a provisioned throughput account for cost efficiency at scale.

### Storage Account Public Blob for Questions
Questions data is non-sensitive documentation. Making it publicly accessible means the Azure Function can read it without needing to manage SAS tokens or Managed Identities for local development.

---

## Data Model Decisions

### UUIDs as Question IDs
Generated at conversion time (Excel → JSON). The `progress` map in a Project document is keyed by these UUIDs. If questions are re-imported from Excel, existing IDs are preserved by content-hashing or manual maintenance — this is the main operational risk to manage.

### Normalised `subArea` field name
Excel column is `SUB-AREA`; normalised to `subArea` (camelCase) in JSON to match JavaScript conventions and avoid bracket notation throughout the codebase.

---

## Future Considerations

- **Dataverse migration**: Replace Blob Storage questions with Dataverse Web API behind `GET /api/questions`. No frontend change.
- **Question versioning**: Add a `version` field to questions.json and surface it in the UI so consultants know what version of the checklist they are working with.
- **Shared projects**: Currently projects are owned by a single `userId`. Multi-user sharing would require an ACL array field on the project document and a sharing UI.
- **Power Apps / Teams embedding**: SWA can be embedded in Teams tabs via the Teams app manifest.
