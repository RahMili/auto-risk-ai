# AutoRisk AI — Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│                    (HTTP/SSE Client)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Application                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   /health    │  │   /upload    │  │   /analyze   │          │
│  │   endpoint   │  │   endpoint   │  │   endpoint   │          │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘          │
│                            │                  │                  │
│                            ▼                  ▼                  │
│                    ┌────────────────────────────────┐           │
│                    │    File Parser Service         │           │
│                    │  (PyPDF2, python-docx)         │           │
│                    └────────────────────────────────┘           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LangGraph Pipeline (Multi-Agent)               │
│                                                                   │
│  ┌──────────────────┐        ┌─────────────────────┐           │
│  │ Profile Parser   │───────▶│ Task Decomposition  │           │
│  │    Agent         │        │      Agent          │           │
│  └──────────────────┘        └──────────┬──────────┘           │
│                                          │                       │
│                                          ▼                       │
│                              ┌───────────────────────┐          │
│                              │ Automation Risk       │          │
│                              │ Scorer (Pure Python)  │          │
│                              └──────────┬────────────┘          │
│                                          │                       │
│                                          ▼                       │
│                              ┌───────────────────────┐          │
│                              │ Recommendation        │          │
│                              │ Engine (Agent)        │          │
│                              └──────────┬────────────┘          │
│                                          │                       │
│                              ┌───────────▼────────────┐         │
│                              │  should_roast?         │         │
│                              │  (Conditional Branch)  │         │
│                              └───┬──────────────┬─────┘         │
│                                  │ yes          │ no            │
│                      ┌───────────▼─────┐       │               │
│                      │ Roast Generator │       │               │
│                      │     Agent       │       │               │
│                      └───────────┬─────┘       │               │
│                                  │             │               │
│                                  └──────┬──────┘               │
│                                         ▼                       │
│                              ┌───────────────────────┐         │
│                              │   Save Report         │         │
│                              └───────────────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   AWS S3         │  │  AWS DynamoDB    │  │  LLM API     │  │
│  │ (File Storage)   │  │  (Job Tracking)  │  │ (Claude/GPT) │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Layers

### 1. API Layer (FastAPI)
- **Responsibility**: HTTP request handling, validation, routing, SSE streaming
- **Key Components**:
  - Route handlers (`app/api/routes/`)
  - Request/response schemas (`app/schemas/`)
  - Middleware (CORS, logging)
  - Health check endpoint
- **Dependencies**: Pydantic for validation, Starlette for SSE

### 2. Core Services Layer
- **Responsibility**: Cross-cutting concerns and infrastructure
- **Key Components**:
  - Configuration management (`app/core/config.py`)
  - LLM client abstraction (`app/core/llm.py`)
  - AWS client management (`app/core/aws.py`)
  - Logging setup (`app/core/logging.py`)
- **Pattern**: Dependency injection via Pydantic settings

### 3. Agent Orchestration Layer (LangGraph)
- **Responsibility**: Multi-agent workflow coordination and state management
- **Key Components**:
  - Pipeline orchestrator (`app/agents/pipeline.py`)
  - Individual agent nodes (parser, decomposer, recommender, roaster)
  - Pure Python scorer (non-LLM logic)
  - Conditional routing logic
- **Pattern**: State machine with typed state objects, conditional branching

### 4. Integration Layer
- **Responsibility**: External service communication
- **Key Components**:
  - S3 file operations (upload, download, save reports)
  - DynamoDB job tracking (create, update, query)
  - LLM API calls (via LangChain)
- **Pattern**: Async I/O, retry logic, connection pooling

## Key Patterns

### Multi-Agent Pipeline (LangGraph)
- **What**: Orchestrated workflow where each agent performs a specialized task
- **Why**: Modularity, maintainability, clear separation of concerns
- **Implementation**:
  - Graph-based state machine
  - Typed state objects passed between nodes
  - Conditional edges for branching logic (roast mode)
  - SSE progress updates at each node

### Event-Driven Architecture
- **What**: Server-Sent Events (SSE) for real-time progress streaming
- **Why**: Provides user feedback during long-running analysis
- **Implementation**:
  - FastAPI EventSourceResponse
  - Yield-based streaming from pipeline
  - Non-blocking async execution

### Modular Monolith
- **What**: Single deployable unit with clear module boundaries
- **Why**: Simplifies deployment while maintaining clean architecture
- **Implementation**:
  - Feature-based package structure
  - Dependency injection via settings
  - Shared core services
  - Clear interface contracts between layers

### Provider Abstraction Pattern
- **What**: Unified interface for multiple LLM providers
- **Why**: Flexibility to switch between Anthropic and OpenAI
- **Implementation**:
  - LangChain LLM wrappers
  - Environment-driven provider selection
  - Common configuration interface

### Async I/O Throughout
- **What**: Non-blocking I/O for all external operations
- **Why**: Scalability, responsiveness, efficient resource usage
- **Implementation**:
  - `async/await` syntax
  - `aioboto3` for AWS services
  - FastAPI async route handlers

## Data Flow

### Upload Flow
```
Client → POST /upload
  → File validation
  → Parse file (PyPDF2/python-docx)
  → Extract text
  → Save original file to S3 (uploads/{file_id}/original/)
  → Save extracted text to S3 (uploads/{file_id}/extracted_text.txt)
  → Return file_id + extracted_text
```

### Analysis Flow
```
Client → POST /analyze (file_id, text, roast_mode)
  → Create job in DynamoDB (status: pending)
  → Start LangGraph pipeline:
      1. Profile Parser → Extract structured data from text
      2. Task Decomposer → Break role into automatable tasks
      3. Risk Scorer → Calculate automation risk score (0-100)
      4. Recommender → Generate upskilling recommendations
      5. Roaster (conditional) → Generate technical roast if enabled
  → Save report to S3 (reports/{job_id}.json)
  → Update DynamoDB (status: completed)
  → Stream result via SSE
```

## ADRs

### ADR-001: LangGraph for Multi-Agent Orchestration
- **Context**: Need to coordinate multiple LLM calls with conditional logic
- **Decision**: Use LangGraph for state machine-based agent orchestration
- **Consequences**: 
  - ✅ Clear workflow visualization
  - ✅ Type-safe state management
  - ✅ Easy to add/remove agents
  - ⚠️ Learning curve for LangGraph API

### ADR-002: S3 + DynamoDB for Storage
- **Context**: Need persistent storage for files and job tracking
- **Decision**: Use AWS S3 for blob storage, DynamoDB for job metadata
- **Consequences**:
  - ✅ Scalable and managed
  - ✅ Pay-per-use pricing
  - ⚠️ AWS vendor lock-in
  - ⚠️ Requires AWS credentials management

### ADR-003: SSE for Real-Time Progress
- **Context**: Analysis pipeline can take 30-60 seconds, need user feedback
- **Decision**: Use Server-Sent Events for streaming progress updates
- **Consequences**:
  - ✅ Simple to implement with FastAPI
  - ✅ Unidirectional communication (sufficient for progress updates)
  - ✅ Automatic reconnection in browsers
  - ⚠️ Not suitable for bidirectional communication

### ADR-004: Provider-Agnostic LLM Interface
- **Context**: Want flexibility to use Anthropic or OpenAI models
- **Decision**: Use LangChain's provider abstraction with env-based config
- **Consequences**:
  - ✅ Easy to switch providers
  - ✅ Consistent API across providers
  - ⚠️ Additional abstraction layer
  - ⚠️ Limited access to provider-specific features
