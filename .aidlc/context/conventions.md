# AutoRisk AI — Conventions

## File Organization

### Backend layout

```
backend/
  app/
    main.py                 # FastAPI app wiring (routers, CORS, logging)
    api/routes/             # Route modules (one router per capability)
      health.py
      upload.py
      analyze.py
      download.py
    agents/                 # LangGraph nodes (LLM agents + pure Python scorer)
      pipeline.py           # Graph wiring and streaming runner
      parser.py
      decomposer.py
      scorer.py
      recommender.py
      roaster.py
    core/                   # Cross-cutting services
      config.py             # Pydantic Settings, env binding
      llm.py                # Provider selection, LLM factory
      aws.py                # S3/DynamoDB integrations (async)
      logging.py            # Logging setup + logger helper
    schemas/                # Pydantic models + TypedDict pipeline state
      upload.py
      analysis.py
```

### Module responsibility rules (as implemented)
- `app/api/routes/*`: HTTP boundary only. Parse request inputs (mostly via `Form(...)`), return responses (`StreamingResponse`, `HTTPException`).
- `app/agents/*`: Business logic and LLM prompts live here. Each agent exposes an `async def ... (state: PipelineState) -> dict` returning a **partial state update**.
- `app/agents/pipeline.py`: Owns LangGraph graph construction, orchestration, and SSE-friendly streaming.
- `app/core/*`: Infrastructure helpers (settings, logging, AWS clients, LLM factory).
- `app/schemas/*`: Pydantic models used for runtime validation; `PipelineState` is a `TypedDict` used as the LangGraph state type.

## Naming

### Python
- File names: `snake_case.py`.
- Functions: `snake_case`.
- Classes / Pydantic models: `PascalCase` (`ParsedProfile`, `RiskScore`).
- Constants: `UPPER_SNAKE_CASE` (`ALLOWED_TYPES`, `MAX_FILE_SIZE`).

### API routes
- Routers are mounted in `backend/app/main.py`.
- Route module name matches capability: `upload.py` defines `/upload`, `analyze.py` defines `/analyze`, etc.
- Download uses a path param: `/download/{job_id}`.

## Data Modeling & Validation

### Pydantic-first
- Pydantic models in `backend/app/schemas/*.py` are used to validate LLM JSON outputs:
  - Agents parse JSON with `json.loads(response.content.strip())`, then validate by constructing a Pydantic model (e.g., `ParsedProfile(**data)`).
- `PipelineState` is a `TypedDict` with fields stored as `dict` during execution and rehydrated into Pydantic models near the end of the pipeline.

### Pipeline state updates
- Each agent returns a `dict` with one top-level key (e.g., `{"profile": data}` / `{"tasks": data}` / `{"risk": {...}}`).
- The pipeline runner merges partial updates into `accumulated_state` using `dict.update()`.

## Async & I/O

- Route handlers are `async def` for upload/analyze/download.
- LLM calls use `await llm.ainvoke(messages)`.
- AWS operations are async using `aioboto3` clients/resources.

## LLM Prompting Conventions

- Agents define:
  - A `SYSTEM` string describing role + strict formatting constraints.
  - A `PROMPT` string that embeds inputs and defines the JSON schema.
- Output contract:
  - Parser/Decomposer/Recommender: **Return ONLY valid JSON** (no markdown/backticks).
  - Roaster: plain text only, 3–4 sentences.

## Error Handling

### HTTP layer
- Use `HTTPException` for client-visible failures (e.g., unsupported file type, report not ready).
- Upload validates:
  - MIME type allowlist
  - Max size (5MB)
  - Non-empty extracted text

### Pipeline layer
- `run_pipeline()` wraps graph execution in `try/except`.
- On exception:
  - Logs exception with stack trace
  - Updates DynamoDB job status to `failed`
  - Streams `error:<message>` via SSE

## Logging

- `backend/app/main.py` calls `setup_logging()` at import time.
- Logging format is:
  - `%(asctime)s | %(levelname)-8s | %(name)s | %(message)s`
- Prefer module-level logger via `get_logger(__name__)`.
- Pipeline logs node completion and partial updates at DEBUG level.

## AWS Conventions

- Uploads are stored under:
  - `uploads/{file_id}/original/{filename}`
  - `uploads/{file_id}/extracted_text.txt`
- Reports are stored under:
  - `reports/{job_id}.json`
- DynamoDB primary key: `job_id`.
- Job status values used in code:
  - `processing`, `complete`, `failed`

## Streaming (SSE-ish) Conventions

- `/analyze` returns `StreamingResponse(..., media_type="text/event-stream")`.
- Stream messages are newline-delimited `key:value` style:
  - `job_id:<uuid>`
  - `status:<Humanized Node Name>...`
  - `chunk:<1024-bytes-of-json>` repeated
  - `done:` sentinel
  - `error:<message>` on failure

## Testing

- No test suite is currently present under `backend/tests/`.
- If adding tests, follow FastAPI conventions:
  - Use `pytest`
  - Keep tests under `backend/tests/` mirroring module paths

## Git Conventions

- Repo appears to use short, imperative commit messages (e.g., “adding download api...”, “making roaster more savage”).
- Prefer small, focused commits aligned to a feature/bug.

## Formatting & Style

- Codebase mostly follows PEP 8 conventions informally.
- Imports are grouped by standard library → third-party → local (`app.*`).
- Prefer explicit typing where it clarifies boundaries (`PipelineState`, `AsyncGenerator[str, None]`).
