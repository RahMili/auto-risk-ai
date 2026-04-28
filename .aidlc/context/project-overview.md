# AutoRisk AI — Project Overview

## What It Does

AutoRisk AI is an intelligent career analysis platform that evaluates how susceptible a role or skillset is to AI-driven automation. By analyzing a resume or professional profile, AutoRisk AI generates an **Automation Risk Score**, highlights exposure areas, and provides actionable recommendations to stay competitive in an AI-first world.

The platform helps professionals understand:
- Which parts of their work are highly automatable
- Which skills provide strong human defensibility
- Where to upskill to remain future-proof

The goal is awareness and empowerment — not fear.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + Uvicorn |
| Agent Orchestration | LangGraph + LangChain |
| LLM | Anthropic Claude / OpenAI GPT (configurable) |
| File Parsing | PyPDF2, python-docx |
| Storage | AWS S3 |
| Job Tracking | AWS DynamoDB |
| Frontend | React + Vite (Phase 3 — planned, not in current scope) |
| Language | Python 3.12 |

## Project Scope

### In Scope (Phase 1 & 2)
- FastAPI backend with RESTful API
- LangGraph multi-agent pipeline for resume analysis
- Profile parsing and task decomposition
- Automation risk scoring engine
- Recommendation generation
- Optional roast mode
- File upload and parsing (PDF/DOCX/TXT)
- AWS S3 integration for file and report storage
- AWS DynamoDB for job tracking
- Server-Sent Events (SSE) streaming for real-time progress
- API documentation (OpenAPI/Swagger)

### Out of Scope (Current Phase)
- React frontend (Phase 3)
- User authentication and authorization
- Multi-user support
- Labor market demand integration
- Salary vs automation risk analysis
- Industry-level dashboards
- Organization-wide workforce reports
- Longitudinal career tracking
- CLI tool
- Mobile applications

### Core Deliverables
1. `/health` endpoint for health checks
2. `/upload` endpoint for resume file processing
3. `/analyze` endpoint with SSE streaming for full analysis pipeline
4. Complete multi-agent LangGraph workflow
5. Automated scoring and recommendation system
