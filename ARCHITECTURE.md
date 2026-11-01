# Architecture & System Design

## 1. Layer Map & Dependency Rules

The application is strictly partitioned into three isolated tiers to guarantee separation of concerns:

```
                  ┌──────────────────────┐
                  │        shared/       │
                  │ (pure domain logic)  │
                  └──────────┬───────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
   ┌────────────────────┐        ┌────────────────────┐
   │      server/       │        │        src/        │
   │ (Express + Gemini) │        │ (React SPA Client) │
   └────────────────────┘        └────────────────────┘
```

### Dependency Rules:
1. **`shared/`**: Contains pure domain logic, data templates, type definitions, and mathematical engines. It has zero external dependencies, no DOM APIs, no Node.js builtins, and no AI SDK references.
2. **`server/`**: Imports from `shared/` and `@google/genai`. Exposes structured JSON and SSE endpoints.
3. **`src/`**: Imports from `shared/` and React libraries. Communicates with `server/` exclusively via HTTP/SSE fetch calls.
4. **Strict Isolation Rule**: Under no circumstances may `src/` or `shared/` import `@google/genai` or any server-only modules. All AI requests must route through backend endpoints.

---

## 2. Data Flow Architecture

### Client-Side State & Plan Pipeline

```
[User Input: Intake Wizard]
             │
             ▼
   validateIntakeData() ──(valid)──► createPlan() [Plan Engine]
                                            │
                                            ├─► allocateBudget() [Largest Remainder]
                                            ├─► buildTimeline() [Backward offsets]
                                            └─► getInitialVendors() [Category Seeds]
                                            │
                                            ▼
                                     [EventPlan Object]
                                            │
                                            ▼
                                   [PlanContext / Reducer]
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
      [Budget Planner]             [Timeline Schedule]           [Vendor Checklist]
```

### Server-Side AI Request Pipeline (SSE Streaming)

```
[Client POST /api/*-stream]
             │
             ▼
   [Express Security Middleware] ──► (X-Content-Type-Options, Referrer-Policy, CSP)
             │
             ▼
   [aiRateLimiter Middleware]   ──► (In-memory token bucket; 429 on exhaustion)
             │
             ▼
   [Request Validation]         ──► (validateIntakeData or isValidPlanPayload)
             │
             ▼
   [pipeAiStreamToSse]
             │
             ├─► [AI Configured?]
             │         │
             │         ├─► YES: Gemini API generateStream() ──► SSE chunks (`data: ...\n\n`)
             │         │
             │         └─► NO:  Local deterministic fallback ─► SSE chunks
             │
             ▼
   [Client useAiStream Hook]    ──► (Decodes SSE, updates UI progressively)
```

---

## 3. Engineering Conventions

### Naming & Organization
- **Types**: Declared in `shared/types.ts` as PascalCase interfaces or discriminated unions (`ValidationResult<T>`, `BudgetCategoryItem`, `TimelineTask`).
- **Constants**:
  - Domain constants, limits, and rate limits reside in `shared/constants.ts`.
  - Reusable Tailwind token strings reside in `src/components/ui/styles.ts`.
- **Pure Helpers**: Functions in `shared/` must remain deterministic and side-effect free. Date/time calculations must use UTC midnight representations (`parseUtcMidnight`, `formatUtcDate`) to prevent DST drift.

### How to Add a New Event Type
1. Add the event type string literal to `EventType` union in `shared/types.ts`.
2. Add budget template categories in `shared/data/budgetTemplates.ts`.
3. Add timeline offset tasks in `shared/data/timeline.<type>.ts` and register in `shared/timeline.ts`.
4. Add vendor checklist seeds in `shared/data/vendorItems.ts`.
5. Add fallback prompt ideas in `shared/data/fallbackIdeas.ts`.
6. Add the type option to `EVENT_TYPE_OPTIONS` in `shared/constants.ts`.

### How to Add a New AI Streaming Route
1. Define the system/user prompt builder in `server/ai/prompts.ts` using `wrapUserInput()`.
2. Define the fallback generator in `server/ai/fallbacks.ts`.
3. Create the route handler in `server/routes/<name>.ts` using `pipeAiStreamToSse()` from `server/ai/sse.ts`.
4. Register the router in `server/app.ts` under `/api/<name>-stream`.
