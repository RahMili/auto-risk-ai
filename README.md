# 🚦 AutoRisk AI

> Measure your Automation Risk. Future‑Proof Your Career. Get Roasted (Technically).

AutoRisk AI is an intelligent career analysis platform that evaluates how susceptible a role or skillset is to AI-driven automation. By analyzing a resume or professional profile, AutoRisk AI generates an **Automation Risk Score**, highlights exposure areas, and provides actionable recommendations to stay competitive in an AI-first world.

---

## 🎯 Vision

AI is not replacing jobs — it is replacing tasks.

AutoRisk AI helps professionals understand:

* Which parts of their work are highly automatable
* Which skills provide strong human defensibility
* Where to upskill to remain future-proof

The goal is awareness and empowerment — not fear.

---

## ⚙️ Key Features

### 📄 Profile Analysis

* Accepts resume (PDF/DOCX/TXT)
* Extracts structured data: roles, skills, tools, responsibilities, experience
* User can review and edit extracted text before analysis

### 🧠 Task Decomposition Engine

* Breaks job roles into granular task-level components
* Classifies tasks by automation exposure

### 📊 Automation Risk Score (0–100)

* Weighted automability scoring model
* Interpretable category bands
* Transparent reasoning behind score

### 🛡 AI-Resilience Breakdown

* High automation exposure areas
* AI-resistant strengths
* Human-critical capabilities

### 🚀 Future-Proof Recommendations

* Skill upgrade roadmap
* Role evolution guidance
* Suggested transition paths

### 🔥 Roast Mode (Optional)

* Technical satire based on stack and responsibilities
* Skill-focused humor (no personal attacks)
* Designed for engagement and virality

---

## 🧮 Scoring Methodology

Each role is decomposed into tasks and evaluated across categories:

* Highly Automatable
* Partially Automatable
* Low Automatable
* Human-Critical

Scoring logic:

```
Score =
(HighAuto * 0.9) +
(PartialAuto * 0.5) +
(LowAuto * 0.2)
```

Final score normalized to 0–100 scale.

### Interpretation Bands

| Score Range | Interpretation                         |
| ----------- | -------------------------------------- |
| 0–30        | Low automation exposure                |
| 31–60       | AI will significantly assist your role |
| 61–80       | High automation exposure               |
| 81–100      | Highly automatable role                |

---

## 🏗 Architecture Overview

AutoRisk AI follows a modular multi-agent pipeline built with LangGraph:

```
User Input (PDF / DOCX / TXT)
   ↓
POST /upload  →  Extracted Text (user reviews & edits)
   ↓
POST /analyze
   ↓
Profile Parser Agent        (LangGraph node)
   ↓
Task Decomposition Agent    (LangGraph node)
   ↓
Automation Risk Scorer      (LangGraph node — pure Python)
   ↓
Recommendation Engine       (LangGraph node)
   ↓
should_roast? ──────────────────────────────┐
   ↓ yes                                    ↓ no
Roast Generator             (LangGraph node — conditional)
   ↓                                        ↓
Save Report  →  S3 + DynamoDB
   ↓
SSE stream result back to client
```

### Core Components

* LangGraph multi-agent pipeline with conditional branching
* LangChain LLM wrappers (Anthropic / OpenAI — configurable)
* Weighted scoring system (pure Python)
* AWS S3 for file and report storage
* AWS DynamoDB for job tracking
* FastAPI backend with Server-Sent Events (SSE) streaming

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + Uvicorn |
| Agent Orchestration | LangGraph + LangChain |
| LLM | Anthropic Claude / OpenAI GPT (configurable) |
| File Parsing | PyPDF2, python-docx |
| Storage | AWS S3 |
| Job Tracking | AWS DynamoDB |
| Frontend | React + Vite (Phase 3 — coming soon) |

---

## 📦 Prerequisites

* Python 3.12
* AWS account with:
  * S3 bucket created
  * DynamoDB table created (partition key: `job_id`, type: String, billing: Provisioned)
  * IAM user with `AmazonS3FullAccess` and `AmazonDynamoDBFullAccess`
* Anthropic API key and/or OpenAI API key

---

## 🚀 Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/autorisk-ai.git
cd autorisk-ai/backend
```

### 2. Create and activate virtual environment

```bash
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# LLM Provider — "anthropic" or "openai"
LLM_PROVIDER=anthropic

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-key-here
ANTHROPIC_MODEL=claude-opus-4-20250514

# OpenAI
OPENAI_API_KEY=your-openai-key-here
OPENAI_MODEL=gpt-4o

# Shared LLM config
MAX_TOKENS=4096
TEMPERATURE=0.3

# AWS
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-s3-bucket-name
DYNAMODB_TABLE_NAME=your-dynamodb-table-name

# App
DEBUG=true
```

### 5. Run the backend

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs at `http://localhost:8000/docs`.

---

## 📡 API Endpoints

### `GET /health`

Health check. Returns app name, active LLM provider, and model.

```bash
curl http://localhost:8000/health
```

```json
{
  "status": "ok",
  "app": "AutoRisk AI",
  "llm_provider": "anthropic",
  "model": "claude-opus-4-20250514"
}
```

---

### `POST /upload`

Upload a resume file (PDF, DOCX, or TXT). Returns extracted text for the user to review and edit before analysis. The original file and extracted text are saved to S3.

**Request** — `multipart/form-data`:

| Field | Type | Description |
|-------|------|-------------|
| file | File | Resume file (PDF / DOCX / TXT, max 5MB) |

**Response**:

```json
{
  "filename": "resume.pdf",
  "content_type": "application/pdf",
  "extracted_text": "John Doe\nSenior Data Analyst...",
  "char_count": 3842,
  "message": "File parsed and saved successfully.",
  "file_id": "a1b2c3d4-...",
  "s3_key": "uploads/a1b2c3d4-.../original/resume.pdf"
}
```

**Example (curl)**:

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@/path/to/resume.pdf"
```

**S3 structure after upload**:

```
your-s3-bucket/
└── uploads/
    └── {file_id}/
        ├── original/resume.pdf       ← raw uploaded file
        └── extracted_text.txt        ← extracted text
```

---

### `POST /analyze`

Run the full automation risk analysis pipeline. Streams results back in real time via Server-Sent Events (SSE). The final report is saved to S3 and the job status is tracked in DynamoDB.

**Request** — `multipart/form-data`:

| Field | Type | Description |
|-------|------|-------------|
| file_id | string | `file_id` returned from `/upload` |
| text | string | Extracted text (optionally edited by user) |
| roast_mode | boolean | Enable roast mode (default: false) |

**Streamed response** — `text/event-stream`:

```
job_id:a1b2c3d4-e5f6-...
status:Saving File...
status:Parse Profile...
status:Decompose Tasks...
status:Calculate Score...
status:Generate Recommendations...
status:Skip Roast...
status:Save Report...
result:{"job_id":"...","profile":{...},"tasks":{...},"risk":{"score":40.4,"band":"moderate",...},"recommendations":{...},"roast":null}
```

**Example (curl)**:

```bash
curl -X POST http://localhost:8000/analyze \
  -F "file_id=a1b2c3d4-..." \
  -F "text=John Doe, Senior Data Analyst, 5 years experience..." \
  -F "roast_mode=false" \
  --no-buffer
```

**S3 structure after analysis**:

```
your-s3-bucket/
├── uploads/
│   └── {file_id}/
│       ├── original/resume.pdf
│       └── extracted_text.txt
└── reports/
    └── {job_id}.json                 ← full analysis report
```

**Typical usage flow**:

1. Call `POST /upload` with the resume file
2. Display `extracted_text` to the user for review and editing
3. Call `POST /analyze` with `file_id` and the (optionally edited) `text`
4. Consume the SSE stream to show real-time progress and final result

---

## 📁 Project Structure

```
autorisk-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, middleware, routes
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic settings (env vars)
│   │   │   ├── llm.py               # LangChain LLM client (Anthropic/OpenAI)
│   │   │   ├── aws.py               # S3 + DynamoDB async clients
│   │   │   └── logging.py           # Logging setup
│   │   ├── agents/
│   │   │   ├── pipeline.py          # LangGraph graph + orchestrator
│   │   │   ├── parser.py            # Profile parser agent
│   │   │   ├── decomposer.py        # Task decomposition agent
│   │   │   ├── scorer.py            # Risk scorer (pure Python)
│   │   │   ├── recommender.py       # Recommendations agent
│   │   │   └── roaster.py           # Roast generator agent
│   │   ├── api/routes/
│   │   │   ├── health.py            # GET /health
│   │   │   ├── upload.py            # POST /upload
│   │   │   └── analyze.py           # POST /analyze (SSE)
│   │   └── schemas/
│   │       ├── upload.py            # Upload request/response models
│   │       └── analysis.py          # Pipeline state + report models
│   ├── .env                         # Local environment variables (git ignored)
│   ├── .env.example                 # Environment variable template
│   ├── .gitignore
│   └── requirements.txt
└── frontend/                        # React app (Phase 3 — coming soon)
```

---

## ⚖️ Ethical Disclaimer

AutoRisk AI provides analytical estimates based on task-level automation reasoning.

* It does NOT predict job loss.
* It does NOT determine employability.
* It does NOT evaluate personal traits.

The system is designed for educational, career-planning, and research purposes only.

---

## 🧪 Future Enhancements

* React frontend (Phase 3)
* Labor market demand integration
* Salary vs automation risk analysis
* Industry-level automation dashboards
* Organization-wide workforce exposure reports
* Longitudinal career tracking

---

## 🤝 Contributing

Contributions are welcome!

* Improve scoring logic
* Enhance task classification
* Add new roast personalities
* Improve UI/UX

Please open an issue before submitting large feature changes.

---

## 📜 License

MIT License

---

## 🌍 Why AutoRisk AI?

In an AI-accelerated economy, understanding automation exposure is a strategic advantage.

AutoRisk AI helps professionals transition from:

Task Executors → System Thinkers  
Operators → Designers  
Manual Workers → AI-Augmented Professionals

**Measure your automation exposure. Upgrade intelligently. Stay ahead.** 🚀