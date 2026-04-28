# Multimodal Academic Performance Prediction System

## TL;DR

> **Build a production-ready multimodal ML system** that predicts student at-risk status by fusing text (DistilBERT), tabular (XGBoost), and behavioral (LSTM) signals. Deployed on AWS EC2 + RDS PostgreSQL with an admin cohort dashboard.
>
> **Deliverables**:
> - FastAPI backend with real-time inference, JWT auth, SHAP explainability
> - Vite + React + TypeScript admin dashboard with cohort views, risk tables, NLG explanations
> - Synthetic dataset generator (CPU-friendly, ~500-2000 students)
> - Docker containerization + AWS deployment guide
> - MLflow experiment tracking
>
> **Estimated Effort**: Large (6-8 weeks for solo dev)
> **Parallel Execution**: YES — 5 waves
> **Critical Path**: Scaffolding → Synthetic Data → Text/Tabular/Behavioral Models → Fusion → API → Frontend → AWS Setup
> **Total Tasks**: 35 implementation + 4 verification = 39 tasks

---

## Context

### Original Request
Build a production-ready multimodal deep learning framework for academic performance prediction using text, tabular, and behavioral data. Frontend: Vite. Backend: Python. Deployed on AWS.

### Interview Summary
**Architecture**: Option A (Lean Production) confirmed by user.
**Deployment**: AWS EC2 + RDS PostgreSQL — manual setup with full documentation.
**Models**: DistilBERT (text) + XGBoost (tabular) + LSTM (behavioral), late fusion ensemble.
**Dataset**: Synthetic, CPU-friendly (~500-2000 students).
**Users**: Admins viewing cohort-level aggregate reports.
**Latency**: Real-time predictions when dashboard loads (<2s target).
**Interpretability**: Human-readable SHAP → natural language for teachers.
**Team**: Solo developer.

### Key Decisions
- Prediction target: **Binary at-risk classification** (not regression) — justified by "early intervention" goal.
- Auth: **JWT-based** — production requirement for admin dashboard.
- State management: **React Query** (server state) + **Zustand** (client state).
- DistilBERT: **Frozen encoder + lightweight classification head** — CPU inference constraint.
- Missing modalities: **Fallback to population mean** — inference works with 1-3 modalities available.
- MLflow: **SQLite tracking + S3 artifacts** — avoids PostgreSQL dependency for MLflow metadata.

### Metis Review
**Identified Gaps** (addressed):
- Auth module missing → Added JWT auth + login page
- Inference latency risk → Guardrail: embedding cache + <2s timeout
- SSL/Elastic IP → Included in AWS wave
- S3 artifact store → Included for MLflow persistence
- Export/mobile/IaC/multi-tenancy → Explicitly OUT OF SCOPE

---

## Work Objectives

### Core Objective
Build and deploy a multimodal ML system that predicts student at-risk status by combining text, tabular, and behavioral data, with human-readable explanations accessible via an admin cohort dashboard.

### Concrete Deliverables
1. `backend/` — FastAPI app with auth, inference, explainability, database layer
2. `frontend/` — Vite + React admin dashboard
3. `data/` — Synthetic dataset generator + preprocessing pipelines
4. `models/` — Trained DistilBERT, XGBoost, LSTM, and fusion ensemble
5. `aws/` — Deployment scripts + setup documentation
6. `docker-compose.yml` — Local development stack
7. `docs/DEPLOYMENT.md` — AWS step-by-step guide

### Definition of Done
- [ ] `docker-compose up` starts backend + frontend + database locally
- [ ] API responds to `/predict` with at-risk probability + explanation in <2s
- [ ] Dashboard displays cohort risk overview with charts and at-risk student table
- [ ] EC2 + RDS deployment accessible via HTTPS with valid SSL
- [ ] Admin login required to access dashboard

### Must Have
- Real-time prediction endpoint
- SHAP-based interpretability with natural language summaries
- JWT authentication
- Cohort-level admin dashboard
- Docker containerization
- AWS deployment (EC2 + RDS)
- Synthetic dataset generator
- Model persistence and versioning

### Must NOT Have (Guardrails)
- Multi-tenancy or multi-institution support
- Real-time model retraining triggered by API
- Individual student drill-down pages (cohort only in v1)
- PDF/CSV export functionality
- Mobile app or native mobile views
- Infrastructure-as-code (Terraform/CloudFormation)
- CI/CD pipeline or automated deployment
- A/B testing or champion/challenger model serving
- Real-time data ingestion/streaming
- Computer vision or additional modalities

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (greenfield)
- **Automated tests**: YES (Tests after)
- **Backend framework**: pytest + pytest-asyncio
- **Frontend framework**: vitest + React Testing Library
- **QA Policy**: Every task includes agent-executed QA scenarios

### QA Policy
Every task MUST include agent-executed QA scenarios:
- **Frontend/UI**: Playwright — navigate, interact, assert DOM, screenshot
- **CLI/Backend**: Bash (curl) — send requests, assert status + response fields
- **Models**: Bash (Python) — run inference, compare outputs, assert shapes

Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — Foundation):
├── Task 1: Initialize git repo + project structure
├── Task 2: Scaffold Vite + React + TS + Tailwind frontend
├── Task 3: Scaffold FastAPI + Python backend + virtual environment
├── Task 4: Set up Docker + docker-compose for local dev
├── Task 5: Initialize PostgreSQL schema + SQLAlchemy models
├── Task 6: Implement JWT authentication module
└── Task 7: Create synthetic data generator

Wave 2 (After Wave 1 — Core ML, MAX PARALLEL):
├── Task 5.5: Create database seeding script (after synthetic data ready)
├── Task 8: Text preprocessing + DistilBERT embedding generation
├── Task 9: Train text model (lightweight classification head)
├── Task 10: Tabular preprocessing + feature engineering (can parallel with 8, 12)
├── Task 11: Train tabular model (XGBoost)
├── Task 12: Behavioral preprocessing + sequence builder (can parallel with 8, 10)
├── Task 13: Train behavioral model (LSTM)
├── Task 14: Implement late fusion ensemble
├── Task 15: Integrate SHAP explainability + NLG summarizer
├── Task 16: Set up MLflow tracking
└── Task 16.5: Create stub API endpoints for frontend (can start immediately after auth)

Wave 3 (After Wave 2 — Backend API):
├── Task 17: Build prediction endpoint (/predict)
├── Task 18: Build cohort aggregation endpoint (/cohort)
├── Task 19: Build health check + model info endpoints
├── Task 20: Implement in-memory embedding cache
├── Task 21: Add input validation + error handling
└── Task 22: Write backend tests (pytest)

Wave 4 (After Wave 3 — Frontend):
├── Task 23: Set up React Query + Zustand state management
├── Task 24: Build admin login page
├── Task 25: Build cohort overview dashboard (charts + metrics)
├── Task 26: Build at-risk student table with explanations
├── Task 27: Build model performance dashboard
└── Task 28: Write frontend tests (vitest)

Wave 5 (After Wave 4 — AWS & Deployment):
├── Task 29: Create AWS setup guide + RDS PostgreSQL
├── Task 30: Create EC2 instance + Docker deployment
├── Task 31: Configure Nginx reverse proxy + SSL (Let's Encrypt)
├── Task 32: Environment configuration + secrets management
├── Task 32.5: Set up CloudWatch logging and basic monitoring
└── Task 33: End-to-end integration test on AWS

Wave FINAL (After ALL tasks — Verification):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
```

### Dependency Matrix

| Task | Blocked By | Blocks |
|------|-----------|--------|
| 1 | — | 2, 3, 4, 5 |
| 2 | 1 | 4, 23-28 |
| 3 | 1 | 4, 5, 6, 7, 8-16 |
| 4 | 1, 2, 3 | 5, 22, 28, 33 |
| 5 | 1, 3 | 6, 17-21 |
| 6 | 1, 3, 5 | 17-21 |
| 7 | 1, 3 | 8, 10, 12, 9, 11, 13 |
| 7.5 | 1, 3 | 8 |
| 8 | 1, 3, 7, 7.5 | 9 |
| 9 | 7, 8 | 14, 15, 16 |
| 10 | 1, 3, 7 | 11 |
| 11 | 7, 10 | 14, 15, 16 |
| 12 | 1, 3, 7 | 13 |
| 13 | 7, 12 | 14, 15, 16 |
| 14 | 9, 11, 13 | 15, 16, 17 |
| 15 | 9, 11, 13, 14 | 17-21 |
| 16 | 3, 9, 11, 13, 14 | — |
| 16.5 | 3, 5, 6 | 23-28 (frontend can start using stubs) |
| 17-21 | 5, 6, 14, 15 | 22, 23, 27 |
| 22 | 17-21 | — |
| 23 | 2, 16.5 | 24-28 |
| 24-28 | 2, 23 | — |
| 29-33 | 4, 5, 6, 17-28 | 33 |
| 32.5 | 30, 32 | 33 |
| F1-F4 | ALL implementation tasks | — |

---

## TODOs

- [x] 1. Initialize Git Repository and Project Structure

  **What to do**:
  - Run `git init` in workspace root.
  - Create standard directory tree:
    ```
    / (root)
    ├── backend/
    │   ├── app/
    │   ├── models/
    │   ├── data/
    │   ├── tests/
    │   └── Dockerfile
    ├── frontend/
    │   ├── src/
    │   ├── public/
    │   └── Dockerfile
    ├── data/
    ├── docs/
    ├── scripts/
    ├── .sisyphus/
    │   ├── evidence/
    │   └── evidence/final-qa/
    └── docker-compose.yml
    ```
  - Add `.gitignore` (Python + Node.js patterns).
  - Create base `README.md` with project overview.
  - Create `docs/ETHICS.md` with data privacy guidelines, synthetic data disclaimer, and bias acknowledgment.
  - Create `.sisyphus/evidence/` and `.sisyphus/evidence/final-qa/` directories for QA evidence.

  **Must NOT do**:
  - Add any generated files, node_modules, or Python cache to git.
  - Include secrets or `.env` files.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `git-master`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: Tasks 2, 3, 4, 5

  **Acceptance Criteria**:
  - [ ] `git status` shows clean working tree
  - [ ] Directory structure matches specification
  - [ ] `.gitignore` ignores `__pycache__`, `node_modules`, `.env`

  **QA Scenarios**:
  - **Happy Path**: Run `ls` → all directories exist. Run `git log` → initial commit present.
  - **Evidence**: `.sisyphus/evidence/task-1-project-structure.png` (screenshot of directory tree)

- [x] 2. Scaffold Vite + React + TypeScript Frontend

  **What to do**:
  - Run `npm create vite@latest frontend -- --template react-ts`.
  - Install dependencies: `react-router-dom`, `@tanstack/react-query`, `zustand`, `tailwindcss`, `postcss`, `autoprefixer`, `recharts`, `lucide-react`.
  - Configure Tailwind (`tailwind.config.js`, `postcss.config.js`).
  - Set up basic folder structure: `src/components/`, `src/pages/`, `src/hooks/`, `src/stores/`, `src/types/`, `src/lib/`.
  - Configure `vite.config.ts` with path aliases.
  - Create placeholder `App.tsx` with routing setup.
  - Create `frontend/.env.example` with `VITE_API_BASE_URL=http://localhost:8000`.
  - Create `frontend/.env.production` (committed) with `VITE_API_BASE_URL=/api`.
  - Verify build with `npm run build`.

  **Must NOT do**:
  - Create any actual pages or components beyond empty placeholders and routing.
  - Add unnecessary state management initialization.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-design`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 3)
  - **Blocked By**: Task 1
  - **Blocks**: Tasks 4, 23-28

  **Acceptance Criteria**:
  - [ ] `npm run dev` starts dev server on port 5173
  - [ ] `npm run build` completes without errors
  - [ ] `npm run build` produces bundle <2MB (check `dist/assets/`)
  - [ ] Tailwind classes work in JSX
  - [ ] React Router renders placeholder routes

  **QA Scenarios**:
  - **Happy Path**: `curl http://localhost:5173` → returns HTML with root div.
  - **Evidence**: `.sisyphus/evidence/task-2-vite-build.png` (build output screenshot)

- [x] 3. Scaffold FastAPI + Python Backend

  **What to do**:
  - Create Python virtual environment (`python -m venv venv`).
  - Create `requirements.txt` with: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `psycopg2-binary`, `alembic`, `pydantic`, `python-jose[cryptography]`, `passlib[bcrypt]`, `python-multipart`, `slowapi`, `psutil`, `email-validator`, `pytest`, `pytest-asyncio`, `httpx`, `transformers`, `torch`, `xgboost`, `scikit-learn`, `pandas`, `numpy`, `shap`, `mlflow`, `python-dotenv`.
  - Create `backend/app/main.py` with basic FastAPI app and health endpoint.
  - Create `backend/app/core/config.py` with Pydantic `BaseSettings`:
    - `DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_ALGORITHM`
    - `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`, `MLFLOW_TRACKING_URI`
    - `ENVIRONMENT` (local/staging/production)
  - Add `.env.example` with placeholder values (never commit real values).
  - Add secret generation script: `scripts/generate_secrets.py`.
  - Create `backend/app/db/base.py` with SQLAlchemy base.
  - Verify startup with `uvicorn app.main:app --reload`.
  - Add `pytest.ini` with test paths and asyncio mode.

  **Must NOT do**:
  - Implement any business logic or routes beyond health check.
  - Download large models during setup.
  - Commit `.env` or any file with real secrets to git.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 2)
  - **Blocked By**: Task 1
  - **Blocks**: Tasks 4, 5, 6, 7, 8-16

  **Acceptance Criteria**:
  - [ ] `uvicorn app.main:app --reload` starts without errors
  - [ ] `GET /health` returns `{"status": "ok"}`
  - [ ] `pytest` runs and finds test directory (0 tests OK for now)

  **QA Scenarios**:
  - **Happy Path**: `curl http://localhost:8000/health` → `{"status":"ok"}`
  - **Evidence**: `.sisyphus/evidence/task-3-fastapi-health.json`

- [x] 4. Set Up Docker and Docker Compose for Local Development

  **What to do**:
  - Create `backend/Dockerfile` (Python 3.11 slim, multi-stage build if possible).
  - Create `frontend/Dockerfile` (Node 20, nginx production stage).
  - Create `docker-compose.yml` with services:
    - `db`: PostgreSQL 15, port 5432
    - `backend`: FastAPI, port 8000, depends on db, **`mem_limit: 3g`** (prevents OOM on t3.medium)
    - `frontend`: nginx serving built Vite app, port 80, proxies `/api` to backend
  - Create `docker-compose.prod.yml` (production variant):
    - Backend only (no frontend dev server; frontend built and served by nginx)
    - Uses RDS for PostgreSQL (no `db` service)
    - Mounts for MLflow artifacts (`backend/mlruns/` and `backend/mlflow.db`)
    - Includes Alembic migration command before starting FastAPI
  - Create `.env.example` with all required environment variables.
  - Configure backend to connect to PostgreSQL container.
  - Verify `docker-compose up --build` starts all services.

  **Must NOT do**:
  - Use docker-compose features not supported by Docker Engine 24+.
  - Hardcode secrets in Dockerfiles.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 2, 3)
  - **Blocked By**: Tasks 1, 2, 3
  - **Blocks**: Tasks 5, 22, 28, 33

  **Acceptance Criteria**:
  - [ ] `docker-compose up --build` starts `db`, `backend`, `frontend` without errors
  - [ ] Backend health endpoint accessible via `http://localhost/api/health`
  - [ ] Frontend loads at `http://localhost`

  **QA Scenarios**:
  - **Happy Path**: `docker-compose ps` → 3 services up.
  - **Evidence**: `.sisyphus/evidence/task-4-docker-compose.png`

- [x] 5. Initialize PostgreSQL Schema and SQLAlchemy Models

  **What to do**:
  - Define SQLAlchemy models:
    - `User` (id, email, hashed_password, role, created_at)
    - `Student` (id, name, cohort_id, demographics JSON)
    - `Prediction` (id, student_id, at_risk_probability, risk_level, explanation_text, text_score, tabular_score, behavioral_score, created_at)
    - `Cohort` (id, name, created_at)
  - Create Alembic migration setup.
  - Generate initial migration.
  - Add database initialization script (`backend/scripts/init_db.py`) that creates tables.
  - **Create minimal seed data** (10 students, 2 cohorts, 1 admin user) directly in `init_db.py` so API development can start immediately without waiting for Task 7 synthetic data.
  - Configure SQLAlchemy engine with connection pooling: `pool_pre_ping=True`, `pool_recycle=3600`, `pool_size=10`, `max_overflow=20`.
  - Verify schema creation in Docker PostgreSQL.

  **Must NOT do**:
  - Add business logic in models.
  - Create overly complex indexes prematurely.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 2, 3, 4)
  - **Blocked By**: Tasks 1, 3
  - **Blocks**: Tasks 6, 17-21

  **Acceptance Criteria**:
  - [ ] `docker-compose exec db pg_dump --schema-only` shows all tables
  - [ ] `User`, `Student`, `Prediction`, `Cohort` tables exist
  - [ ] `alembic current` shows migration hash

  **QA Scenarios**:
  - **Happy Path**: `docker-compose exec db psql -U postgres -c "\dt"` → tables listed.
  - **Evidence**: `.sisyphus/evidence/task-5-schema.txt`

- [x] 5.5. Create Database Seeding Script

  **What to do**:
  - Create `backend/scripts/seed_db.py`:
    - Load synthetic data from `data/raw/` (students, cohorts generated in Task 7).
    - Insert students, cohorts, and default admin user into PostgreSQL.
    - Run automatically during Docker Compose startup (`depends_on` with condition or entrypoint script).
    - Idempotent: running twice should not create duplicates.
  - Add tests for seeding script.

  **Must NOT do**:
  - Seed production database (only run in local/dev environments).
  - Include real PII in seed data.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-5)
  - **Blocked By**: Tasks 5, 7
  - **Blocks**: Task 17 (predictions need students in DB)

  **Acceptance Criteria**:
  - [ ] `docker-compose up` auto-seeds database on first start
  - [ ] `psql -c "SELECT COUNT(*) FROM students"` returns >0 after seeding
  - [ ] Running seed script twice doesn't duplicate records

  **QA Scenarios**:
  - **Happy Path**: `docker-compose exec db psql -U postgres -c "SELECT COUNT(*) FROM students"` → non-zero count.
  - **Evidence**: `.sisyphus/evidence/task-5-5-seeding.txt`

- [x] 6. Implement JWT Authentication Module

  **What to do**:
  - Create `backend/app/auth/` module with:
    - Password hashing with `passlib[bcrypt]`
    - JWT token generation/validation with `python-jose`
    - OAuth2 password flow endpoints (`/auth/login`, `/auth/register`)
    - **JWT delivered via httpOnly cookie** (not response body) for XSS protection
    - Cookie settings: `Secure`, `SameSite=Lax`, max-age=24 hours
    - Dependency `get_current_user` for protected routes (reads JWT from cookie)
  - Add default admin user seeded at startup.
  - Add auth tests in `backend/tests/test_auth.py`.
  - Verify login sets JWT cookie, and protected routes reject unauthenticated requests.

  **Must NOT do**:
  - Implement OAuth2 with external providers (Google, etc.).
  - Build role-based access control beyond `admin` role.
  - Add refresh tokens (use long-lived access tokens for v1).

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-5)
  - **Blocked By**: Tasks 1, 3, 5
  - **Blocks**: Tasks 17-21

  **Acceptance Criteria**:
  - [ ] `POST /auth/login` with valid credentials sets `access_token` httpOnly cookie
  - [ ] `GET /protected` without cookie returns 401
  - [ ] `GET /protected` with valid cookie returns 200
  - [ ] Cookie is `Secure` and `SameSite=Lax`
  - [ ] `pytest backend/tests/test_auth.py` passes

  **QA Scenarios**:
  - **Happy Path**: `curl -X POST http://localhost:8000/auth/login -d "username=admin&password=admin" -v` → response includes `Set-Cookie: access_token=...` header.
  - **Failure**: Same request without credentials → no cookie set, 401 response.
  - **Evidence**: `.sisyphus/evidence/task-6-auth-login-headers.txt`, `.sisyphus/evidence/task-6-auth-fail.json`

- [x] 7. Create Synthetic Dataset Generator

  **What to do**:
  - Create `data/generate_synthetic.py` that generates:
    - **Students**: 500-2000 records (student_id, name, age, gender, socioeconomic_status, prior_gpa, cohort_id)
    - **Text data**: 5-20 reflection/comment texts per student, covering positive/neutral/negative sentiment, varying lengths (50-500 words).
    - **Tabular data**: Attendance (0-100%), assignment_scores (list of 5-15 scores), internal_exam_score (0-100), study_hours_per_week (0-40), extracurricular_count (0-5).
    - **Behavioral data**: LMS interaction logs — timestamps, event_type (login, page_view, assignment_open, assignment_submit, forum_post), duration_seconds. Generate 50-500 events per student over 1 semester.
    - **Labels**: Binary `at_risk` flag (0/1) — correlated with low attendance, negative sentiment, low engagement.
  - Ensure class imbalance (~70% not at-risk, 30% at-risk) — realistic but manageable.
  - Save as CSV/JSON: `data/raw/students.csv`, `data/raw/texts.csv`, `data/raw/behavioral_logs.csv`.
  - Add train/val/test split (70/15/15).
  - Verify file sizes are reasonable (<50MB total).

  **Must NOT do**:
  - Generate >2000 students (CPU training limit).
  - Create perfectly balanced classes (unrealistic).
  - Include PII or realistic names (use fake names).

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-6)
  - **Blocked By**: Tasks 1, 3
  - **Blocks**: Tasks 8, 10, 12, 9, 11, 13

  **Acceptance Criteria**:
  - [ ] `python data/generate_synthetic.py` runs in <60 seconds
  - [ ] Outputs 3 CSV files with expected shapes (students: 500-2000 rows, texts: 2500-40000 rows, behavioral: 25000-1M rows)
  - [ ] `at_risk` distribution is 25-35% positive class
  - [ ] Files saved to `data/raw/`

  **QA Scenarios**:
  - **Happy Path**: `python data/generate_synthetic.py && ls data/raw/` → all 3 files exist, non-empty.
  - **Evidence**: `.sisyphus/evidence/task-7-dataset-sizes.txt`

- [x] 7.5. Implement Model Fallback Configuration

  **What to do**:
  - Create `backend/app/core/model_config.py`:
    - `TEXT_MODEL`: `"distilbert-base-uncased"` (default) or `"sentence-transformers/all-MiniLM-L6-v2"` (fallback)
    - `USE_MINILM_FALLBACK`: `false` by default; set via env var
    - Helper function `get_text_encoder()` that returns the configured model + tokenizer
  - Document the fallback switch in `docs/MODEL_FALLBACK.md`:
    - When to use: t3.medium OOM, embedding generation >30 min, or DistilBERT inference >2s
    - Performance comparison: DistilBERT (768-dim, ~250MB) vs MiniLM (384-dim, ~50MB)
  - Add tests verifying both configurations load correctly.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-7)
  - **Blocked By**: Tasks 1, 3
  - **Blocks**: Task 8

  **Acceptance Criteria**:
  - [ ] `TEXT_MODEL=distilbert-base-uncased` loads DistilBERT
  - [ ] `TEXT_MODEL=all-MiniLM-L6-v2` loads MiniLM
  - [ ] `pytest backend/tests/test_model_config.py` passes

  **QA Scenarios**:
  - **Happy Path**: `python -c "from app.core.model_config import get_text_encoder; m,t=get_text_encoder(); print(m.config.hidden_size)"` → prints 768.
  - **Evidence**: `.sisyphus/evidence/task-7-5-model-config.txt`

- [ ] 8. Text Preprocessing and DistilBERT Embedding Pipeline

  **What to do**:
  - Build `backend/app/preprocessing/text_processor.py`:
    - Load texts, concatenate per student (reflections + comments).
    - Tokenize with `transformers.DistilBertTokenizer` (max_length=256).
    - Use `DistilBertModel` (pre-trained, frozen weights) to generate pooled embeddings.
    - Cache embeddings in-memory or to disk (`backend/cache/text_embeddings.pkl`).
    - Create PyTorch `Dataset` and `DataLoader` for training.
    - **Make resumable**: check if embedding already exists in cache before recomputing.
    - **Time estimate**: 20,000 texts with batch_size=32 on CPU = **10-20 minutes** using `torch.no_grad()`.
    - **Fallback** (footnote only): `sentence-transformers/all-MiniLM-L6-v2` (384-dim) is ~5× faster if needed, but DistilBERT is primary.
    - **Hard requirement**: `torch.set_num_threads(2)` in code to prevent CPU thread explosion and container OOM.
  - Save processed features: `data/processed/text_features.npy`.
  - Verify embedding shape: (n_students, 768).
  - Add tests for text processor.

  **Must NOT do**:
  - Fine-tune DistilBERT (CPU constraint — frozen only).
  - Use `DistilBertForSequenceClassification` directly (we need embeddings for fusion).
  - Store embeddings in database (too large; use files).
  - **Memory guard**: Use `torch.no_grad()` during inference; limit `torch.set_num_threads(2)` to prevent CPU thread explosion.

  **Recommended Agent Profile**:
  - **Category**: `deep`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-7, 10, 12)
  - **Blocked By**: Tasks 1, 3, 7, 7.5
  - **Blocks**: Task 9

  **Acceptance Criteria**:
  - [ ] `python -m app.preprocessing.text_processor` generates `data/processed/text_features.npy`
  - [ ] Shape is (n_students, 768)
  - [ ] Inference time for 10 texts <5 seconds on CPU
  - [ ] `pytest backend/tests/test_text_processor.py` passes

  **QA Scenarios**:
  - **Happy Path**: `python -c "import numpy as np; e=np.load('data/processed/text_features.npy'); print(e.shape)"` → valid shape.
  - **Evidence**: `.sisyphus/evidence/task-8-embedding-shape.txt`

- [ ] 9. Train Text Model (Frozen DistilBERT + Lightweight Classifier Head)

  **What to do**:
  - Build `backend/app/models/text_model.py`:
    - `nn.Sequential(nn.Linear(768, 128), nn.ReLU(), nn.Dropout(0.3), nn.Linear(128, 1), nn.Sigmoid())`
    - Train with `BCEWithLogitsLoss`, `AdamW`, learning_rate=1e-4, 10-20 epochs.
    - Evaluate on validation set: report accuracy, precision, recall, F1, ROC-AUC.
    - Save model: `backend/models/text_model_TIMESTAMP.pt` with symlink `text_model_latest.pt`.
    - Save training metrics to MLflow.
  - Ensure training completes in <30 minutes on CPU.
  - Add inference wrapper: `TextPredictor.predict(student_id_or_text) → probability`.

  **Must NOT do**:
  - Use GPU-specific code (must run on CPU).
  - Train for >20 epochs (overfitting risk + time).
  - Use complex architectures (keep it lightweight).
  - **Memory spike**: If t3.medium still OOMs, explore `torch.float16` or ONNX Runtime as fallback (document in `docs/MODEL_OPTIMIZATION.md`).
  - Load full training data into memory simultaneously (use DataLoader batches).

  **Recommended Agent Profile**:
  - **Category**: `deep`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-8, 11, 13)
  - **Blocked By**: Tasks 7, 8
  - **Blocks**: Tasks 14, 15, 16

  **Acceptance Criteria**:
  - [ ] `python -m app.models.text_model` trains and saves `text_model.pt`
  - [ ] Validation F1 > 0.60 (realistic for synthetic data)
  - [ ] Training time <30 minutes on CPU
  - [ ] MLflow tracking URL shows the experiment run
  - [ ] Inference on single student <1 second

  **QA Scenarios**:
  - **Happy Path**: `python -c "from app.models.text_model import TextPredictor; p=TextPredictor(); print(p.predict('Student is struggling with coursework'))"` → probability between 0 and 1.
  - **Evidence**: `.sisyphus/evidence/task-9-text-model-metrics.json`

- [ ] 10. Tabular Preprocessing and Feature Engineering

  **What to do**:
  - Build `backend/app/preprocessing/tabular_processor.py`:
    - Load `students.csv`.
    - Feature engineering:
      - `attendance_rate` (numeric)
      - `avg_assignment_score` (mean of assignment scores)
      - `assignment_score_std` (variability)
      - `internal_exam_score` (numeric)
      - `study_hours_per_week` (numeric)
      - `extracurricular_count` (numeric)
      - `prior_gpa` (numeric)
      - One-hot encode `gender`, `socioeconomic_status`.
      - Standardize numeric features with `StandardScaler`.
    - Handle missing values: fill with median (numeric), mode (categorical).
    - Save processed features + scaler: `data/processed/tabular_features.npy`, `data/processed/tabular_scaler.pkl`.
    - Add tests.

  **Must NOT do**:
  - Create features that leak target information.
  - Use target encoding (risk of overfitting).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-9, 12)
  - **Blocked By**: Tasks 1, 3, 7
  - **Blocks**: Task 11

  **Acceptance Criteria**:
  - [ ] `python -m app.preprocessing.tabular_processor` generates features and scaler
  - [ ] Feature matrix shape: (n_students, n_features) where n_features >= 8
  - [ ] No NaN values in processed features
  - [ ] `pytest backend/tests/test_tabular_processor.py` passes

  **QA Scenarios**:
  - **Happy Path**: `python -c "import numpy as np; f=np.load('data/processed/tabular_features.npy'); print(f.shape); print(np.isnan(f).sum())"` → no NaNs.
  - **Evidence**: `.sisyphus/evidence/task-10-tabular-features.txt`

- [ ] 11. Train Tabular Model (XGBoost)

  **What to do**:
  - Build `backend/app/models/tabular_model.py`:
    - `xgboost.XGBClassifier(max_depth=4, n_estimators=100, learning_rate=0.1, subsample=0.8, colsample_bytree=0.8)`.
    - Handle class imbalance with `scale_pos_weight`.
    - Evaluate: accuracy, precision, recall, F1, ROC-AUC on validation set.
    - Save model: `backend/models/tabular_model_TIMESTAMP.json` with symlink `tabular_model_latest.json` (XGBoost native format).
    - Save feature importance plot to `docs/`.
    - Log metrics to MLflow.
  - Build inference wrapper: `TabularPredictor.predict(features_array) → probability`.
  - Add tests.

  **Must NOT do**:
  - Use GPU (`tree_method='gpu_hist'`) — must be CPU-compatible.
  - Overfit with deep trees (keep max_depth <= 6).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-10, 13)
  - **Blocked By**: Tasks 7, 10
  - **Blocks**: Tasks 14, 15, 16

  **Acceptance Criteria**:
  - [ ] `python -m app.models.tabular_model` trains and saves `tabular_model.json`
  - [ ] Validation F1 > 0.65 (tabular usually strongest signal)
  - [ ] Training time <5 minutes on CPU
  - [ ] Feature importance plot generated
  - [ ] Inference on single student <50ms

  **QA Scenarios**:
  - **Happy Path**: `python -c "from app.models.tabular_model import TabularPredictor; p=TabularPredictor(); print(p.predict([[0.8, 75, 10, 3, 2.5, 1, 0, 0]]))"` → probability.
  - **Evidence**: `.sisyphus/evidence/task-11-tabular-model-metrics.json`

- [ ] 12. Behavioral Preprocessing and Sequence Builder

  **What to do**:
  - Build `backend/app/preprocessing/behavioral_processor.py`:
    - Load LMS interaction logs.
    - Aggregate per student per day:
      - `daily_login_count`
      - `daily_total_duration`
      - `daily_assignment_opens`
      - `daily_assignment_submissions`
      - `daily_forum_posts`
      - `daily_unique_pages`
    - Create fixed-length sequences (pad/truncate to 30 days):
      - Shape: (n_students, 30, 6) — 30 days × 6 features.
    - Standardize per feature across all students.
    - Handle missing days: pad with zeros.
    - Save: `data/processed/behavioral_sequences.npy`, `data/processed/behavioral_scaler.pkl`.
    - Add tests.

  **Must NOT do**:
  - Use sequences >30 days (LSTM training time on CPU).
  - Include timestamps in model input (use daily aggregates only).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-11)
  - **Blocked By**: Tasks 1, 3, 7
  - **Blocks**: Task 13

  **Acceptance Criteria**:
  - [ ] `python -m app.preprocessing.behavioral_processor` generates sequences
  - [ ] Shape: (n_students, 30, 6)
  - [ ] No NaN values
  - [ ] All sequences same length (padded/truncated)
  - [ ] `pytest backend/tests/test_behavioral_processor.py` passes

  **QA Scenarios**:
  - **Happy Path**: `python -c "import numpy as np; s=np.load('data/processed/behavioral_sequences.npy'); print(s.shape)"` → (N, 30, 6).
  - **Evidence**: `.sisyphus/evidence/task-12-behavioral-sequences.txt`

- [ ] 13. Train Behavioral Model (LSTM)

  **What to do**:
  - Build `backend/app/models/behavioral_model.py`:
    - `nn.LSTM(input_size=6, hidden_size=64, num_layers=2, batch_first=True, dropout=0.3)`.
    - `nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Dropout(0.2), nn.Linear(32, 1), nn.Sigmoid())`.
    - Train with `BCEWithLogitsLoss`, `Adam`, learning_rate=1e-3, 20-30 epochs.
    - Evaluate on validation set.
    - Save: `backend/models/behavioral_model_TIMESTAMP.pt` with symlink `behavioral_model_latest.pt`.
    - Log metrics to MLflow.
  - Build inference wrapper: `BehavioralPredictor.predict(sequence_array) → probability`.
  - Add tests.

  **Must NOT do**:
  - Use bidirectional LSTM (double parameters, slower on CPU).
  - Use >2 LSTM layers (overfitting + training time).
  - Train for >30 epochs.

  **Recommended Agent Profile**:
  - **Category**: `deep`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-12)
  - **Blocked By**: Tasks 7, 12
  - **Blocks**: Tasks 14, 15, 16

  **Acceptance Criteria**:
  - [ ] `python -m app.models.behavioral_model` trains and saves `behavioral_model.pt`
  - [ ] Validation F1 > 0.55 (weakest modality, acceptable)
  - [ ] Training time <20 minutes on CPU
  - [ ] Inference on single student <500ms

  **QA Scenarios**:
  - **Happy Path**: `python -c "from app.models.behavioral_model import BehavioralPredictor; p=BehavioralPredictor(); print(p.predict(np.zeros((1,30,6))))"` → probability.
  - **Evidence**: `.sisyphus/evidence/task-13-behavioral-model-metrics.json`

- [ ] 14. Implement Late Fusion Ensemble

  **What to do**:
  - Build `backend/app/models/fusion_ensemble.py`:
    - Input: [text_prob, tabular_prob, behavioral_prob] for each student.
    - Train XGBoost meta-learner (or logistic regression) to combine probabilities.
    - Handle missing modalities: if modality missing, use population mean probability for that modality.
    - Evaluate on test set: accuracy, precision, recall, F1, ROC-AUC.
    - Compare against best single-modality model.
    - Save: `backend/models/fusion_model.json`.
    - **Model versioning convention**: Include timestamp in filename (e.g., `fusion_model_20240115_143022.json`) and save latest symlink `fusion_model_latest.json`.
    - Log metrics to MLflow.
  - Build `FusionEnsemble.predict(text_prob, tabular_prob, behavioral_prob) → final_probability`.
  - Add calibration: use `sklearn.calibration.CalibratedClassifierCV` if probabilities look uncalibrated.
  - Add tests.

  **Must NOT do**:
  - Use early fusion (concatenating raw features) — maintain interpretability.
  - Use complex stacking — keep it simple for solo dev.

  **Recommended Agent Profile**:
  - **Category**: `deep`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-13)
  - **Blocked By**: Tasks 9, 11, 13
  - **Blocks**: Tasks 15, 16, 17

  **Acceptance Criteria**:
  - [ ] `python -m app.models.fusion_ensemble` trains and saves `fusion_model.json`
  - [ ] Test F1 > 0.70 (ensemble should outperform single modalities)
  - [ ] Training time <2 minutes
  - [ ] Inference on single student <100ms
  - [ ] Missing modality handled gracefully (returns mean probability, no crash)

  **QA Scenarios**:
  - **Happy Path**: `python -c "from app.models.fusion_ensemble import FusionEnsemble; f=FusionEnsemble(); print(f.predict(0.7, 0.8, 0.6))"` → probability.
  - **Missing modality**: `f.predict(0.7, None, 0.6)` → still returns valid probability.
  - **Evidence**: `.sisyphus/evidence/task-14-fusion-metrics.json`

- [ ] 15. Integrate SHAP Explainability and NLG Summarizer

  **What to do**:
  - Build `backend/app/explainability/shap_explainer.py`:
    - Use `shap.TreeExplainer` for tabular XGBoost model.
    - Generate SHAP values for tabular features per prediction.
    - Extract top 3 positive and top 3 negative drivers.
  - Build `backend/app/explainability/nlg_summarizer.py`:
    - Map SHAP feature names + values to natural language templates.
    - Example: "This student is at high risk because: (1) Attendance is only 45% (strong negative factor), (2) Average assignment score dropped to 55%, (3) LMS engagement decreased significantly in the last 2 weeks."
    - Include overall risk level: "High Risk", "Medium Risk", "Low Risk" based on probability thresholds (0.7, 0.4).
    - Include modality contributions: "Text analysis suggests negative sentiment. Tabular data shows poor attendance. Behavioral data indicates low engagement."
  - Build `ExplainabilityService.explain(student_features) → dict` with fields: `risk_level`, `probability`, `top_factors`, `modality_contributions`, `narrative_summary`.
  - Add tests.

  **Must NOT do**:
  - Generate SHAP for DistilBERT text model (too slow on CPU — skip in v1).
  - Use external LLM APIs (OpenAI, etc.) for NLG — templates only, no API costs.
  - Make explanations >200 words (keep concise for dashboard).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-14, 16)
  - **Blocked By**: Tasks 9, 11, 13, 14
  - **Blocks**: Tasks 17-21

  **Acceptance Criteria**:
  - [ ] `python -m app.explainability.shap_explainer` runs without errors
  - [ ] SHAP values generated for tabular features in <1s
  - [ ] NLG summary is human-readable (test by reading 3 examples)
  - [ ] `ExplainabilityService` returns all required fields
  - [ ] `pytest backend/tests/test_explainability.py` passes

  **QA Scenarios**:
  - **Happy Path**: `curl -X POST http://localhost:8000/explain -d '{"student_id": 1}'` → returns JSON with `narrative_summary` containing natural language.
  - **Evidence**: `.sisyphus/evidence/task-15-explanation-example.json`

- [ ] 16. Set Up MLflow Experiment Tracking

  **What to do**:
  - Initialize MLflow in `backend/app/core/mlflow.py`:
    - Tracking URI: local SQLite (`sqlite:///backend/mlflow.db`) or file store.
    - Artifact store: local directory `backend/mlruns/` (S3 configured later in AWS tasks).
    - Helper functions: `start_run()`, `log_params()`, `log_metrics()`, `log_model()`, `end_run()`.
  - Integrate MLflow logging into all training scripts (Tasks 9, 11, 13, 14).
  - Provide access to MLflow UI via `mlflow server` command.
  - Add `docs/MLFLOW.md` with usage instructions.

  **Must NOT do**:
  - Set up remote MLflow tracking server (local only for v1).
  - Use PostgreSQL for MLflow metadata (keeps it simple).

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-15)
  - **Blocked By**: Task 3
  - **Blocks**: — (additive to other tasks)

  **Acceptance Criteria**:
  - [ ] `mlflow ui` launches UI on port 5000
  - [ ] All model training runs logged with params and metrics
  - [ ] Model artifacts saved to `backend/mlruns/`

  **QA Scenarios**:
  - **Happy Path**: `mlflow ui` → accessible at `http://localhost:5000`, shows experiments.
  - **Evidence**: `.sisyphus/evidence/task-16-mlflow-ui.png`

- [ ] 16.5. Create Stub API Endpoints for Frontend Development

  **What to do**:
  - Create `backend/app/api/stubs.py` with mock endpoints that return realistic dummy data:
    - `GET /stub/cohort/{id}` — returns mock cohort summary with 50 students, risk distribution, metrics.
    - `POST /stub/predict` — returns mock prediction with random probability + mock NLG explanation.
    - `GET /stub/models` — returns mock model metadata and performance metrics.
  - Create `backend/app/api/__init__.py` to register routes conditionally (`if ENVIRONMENT != "production"`).
  - Frontend can develop against these stubs immediately while ML models are training in Wave 2.
  - Add clear `TODO` comments indicating these are temporary stubs.
  - Create `docs/API_CONTRACT.md` documenting request/response shapes for all real endpoints (`/predict`, `/cohort`, `/models`, `/health`, `/auth/login`). This is the single source of truth for frontend-backend contract.

  **Must NOT do**:
  - Register stub routes in production environment.
  - Use production database in stubs (return static JSON only).
  - Leave stubs unmarked — must be clearly labeled as temporary.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-16, 8-15)
  - **Blocked By**: Tasks 3, 5, 6
  - **Blocks**: Tasks 23-28 (frontend can start immediately using stubs)

  **Acceptance Criteria**:
  - [ ] `GET /stub/cohort/1` returns realistic mock data
  - [ ] `POST /stub/predict` returns prediction + explanation
  - [ ] Stubs NOT available when `ENVIRONMENT=production`
  - [ ] Frontend can render dashboard using stub data

  **QA Scenarios**:
  - **Happy Path**: `curl http://localhost:8000/stub/cohort/1` → JSON with students array.
  - **Evidence**: `.sisyphus/evidence/task-16-5-stub-api.json`

- [ ] 17. Build Prediction Endpoint (`POST /predict`)

  **What to do**:
  - Create `backend/app/api/predictions.py`:
    - `POST /predict` — accepts `student_id` and optional raw data.
    - Loads student from DB, fetches processed features from files/memory.
    - Runs text → tabular → behavioral → fusion inference pipeline.
    - Returns: `{"student_id": 1, "at_risk_probability": 0.82, "risk_level": "High", "explanation": {...}}`.
    - Uses ExplainabilityService for SHAP + NLG.
    - Saves prediction to `predictions` table.
  - Add request/response Pydantic schemas.
  - Add rate limiting (`slowapi`) — max 10 requests/minute per IP for `/predict`.
  - Verify inference latency <2s on CPU.
  - Add tests.

  **Must NOT do**:
  - Accept unvalidated raw data without schema checks.
  - Trigger retraining from API.
  - Return raw SHAP arrays to frontend (always NLG).
  - **Memory guard**: Use `torch.no_grad()` for all model inference calls; use `gc.collect()` after large batch predictions.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-16, 18-21)
  - **Blocked By**: Tasks 5, 6, 14, 15
  - **Blocks**: Tasks 22, 23, 27

  **Acceptance Criteria**:
  - [ ] `POST /predict` with valid student_id returns prediction + explanation in <2s
  - [ ] Response schema matches Pydantic model
  - [ ] Prediction saved to database
  - [ ] Rate limiting enforced (11th request in 1 min → 429)
  - [ ] `pytest backend/tests/test_predictions.py` passes

  **QA Scenarios**:
  - **Happy Path**: `curl -X POST http://localhost:8000/predict -H "Authorization: Bearer $TOKEN" -d '{"student_id": 1}'` → returns probability + explanation.
  - **Rate Limit**: Send 11 requests rapidly → 11th returns 429.
  - **Latency**: Time request with `time curl ...` → <2s.
  - **Evidence**: `.sisyphus/evidence/task-17-predict-response.json`, `.sisyphus/evidence/task-17-latency.txt`, `.sisyphus/evidence/task-17-rate-limit.json`

- [ ] 18. Build Cohort Aggregation Endpoint (`GET /cohort`)

  **What to do**:
  - Create `backend/app/api/cohorts.py`:
    - `GET /cohort/{cohort_id}` — returns cohort summary:
      - Total students, at-risk count, at-risk percentage.
      - Risk distribution histogram.
      - Average modality scores.
      - List of at-risk students with explanations.
    - Query `predictions` table (pre-computed or real-time).
    - Add pagination for large cohorts (default 50 per page).
    - Add sorting (by risk probability, by name).
    - Add filtering (by risk level, by date range).
  - Add request/response schemas.
  - Add tests.

  **Must NOT do**:
  - Calculate cohort stats on-the-fly if too slow (pre-compute or cache).
  - Expose raw student PII beyond name and risk status.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-17, 19-21)
  - **Blocked By**: Tasks 5, 6
  - **Blocks**: Tasks 22, 23, 25-27

  **Acceptance Criteria**:
  - [ ] `GET /cohort/1` returns summary, distribution, and student list
  - [ ] Response time <1s for cohorts up to 500 students
  - [ ] Pagination works (`?page=2&limit=20`)
  - [ ] `pytest backend/tests/test_cohorts.py` passes

  **QA Scenarios**:
  - **Happy Path**: `curl http://localhost:8000/cohort/1 -H "Authorization: Bearer $TOKEN"` → JSON with `students` array.
  - **Evidence**: `.sisyphus/evidence/task-18-cohort-response.json`

- [ ] 19. Build Health Check and Model Info Endpoints

  **What to do**:
  - Extend `backend/app/api/health.py`:
    - `GET /health` — db connectivity, model load status, memory usage.
    - `GET /info` — model versions, training dates, performance metrics.
    - `GET /models` — list available models with metadata.
  - Add tests.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-18)
  - **Blocked By**: Task 3
  - **Blocks**: —

  **Acceptance Criteria**:
  - [ ] `GET /health` returns db status, model status, memory usage
  - [ ] `GET /info` returns model metadata
  - [ ] `pytest backend/tests/test_health.py` passes

  **QA Scenarios**:
  - **Happy Path**: `curl http://localhost:8000/health` → `{"db": "ok", "models": "ok", "memory_mb": 512}`.
  - **Evidence**: `.sisyphus/evidence/task-19-health.json`

- [ ] 20. Implement In-Memory Embedding Cache

  **What to do**:
  - Create `backend/app/core/cache.py`:
    - Simple dict-based cache for text embeddings (key: student_id, value: embedding).
    - TTL: 1 hour or manual invalidation.
    - Cache size limit: 1000 entries (LRU eviction).
    - Used in prediction endpoint to avoid re-computing DistilBERT embeddings.
  - Add cache hit/miss metrics.
  - Verify cache reduces repeated prediction latency by >50%.

  **Must NOT do**:
  - Use Redis (overkill for v1; in-memory sufficient for single EC2 instance).
  - Cache predictions themselves (we want fresh predictions per request).

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-19)
  - **Blocked By**: Tasks 3, 8
  - **Blocks**: Task 17 (additive optimization)

  **Acceptance Criteria**:
  - [ ] First prediction for student takes <2s
  - [ ] Second prediction for same student takes <1s (cache hit)
  - [ ] Cache eviction works at limit

  **QA Scenarios**:
  - **Happy Path**: Time two identical predictions → second is faster.
  - **Evidence**: `.sisyphus/evidence/task-20-cache-latency.txt`

- [ ] 21. Add Input Validation and Error Handling

  **What to do**:
  - Add global exception handler in FastAPI:
    - `ValidationError` → 400 with field-level details.
    - `ModelNotFoundError` → 404.
    - `PredictionError` → 500 with safe message (no stack traces in production).
    - `AuthenticationError` → 401/403.
  - Add request logging middleware.
  - Add CORS configuration:
    - `allow_credentials=True` (required for httpOnly cookies)
    - `allow_origins=[FRONTEND_URL]` (explicit, not `*`)
    - `allow_methods=["GET","POST","PUT","DELETE"]`
  - Add input sanitization for text fields (prevent XSS in DB).
  - Verify with tests.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-20)
  - **Blocked By**: Task 3
  - **Blocks**: Tasks 22, 33

  **Acceptance Criteria**:
  - [ ] Invalid JSON → 400 with clear message
  - [ ] Nonexistent student_id → 404
  - [ ] Malformed auth token → 401
  - [ ] Server error → 500 without stack trace
  - [ ] CORS preflight passes from frontend origin with `credentials: include`
  - [ ] CORS rejects requests from unauthorized origins
  - [ ] `pytest backend/tests/test_errors.py` passes

  **QA Scenarios**:
  - **Validation**: `curl -X POST /predict -d '{"student_id": "abc"}'` → 400.
  - **Auth**: `curl /predict` without header → 401.
  - **Evidence**: `.sisyphus/evidence/task-21-errors.json`

- [ ] 22. Write Backend Tests (pytest)

  **What to do**:
  - Achieve >60% coverage for backend:
    - `test_auth.py` — login, register, protected routes.
    - `test_predictions.py` — predict endpoint valid + invalid cases.
    - `test_cohorts.py` — cohort summary, pagination.
    - `test_models.py` — model inference wrappers.
    - `test_explainability.py` — SHAP + NLG output validation.
  - Use `pytest-asyncio` for async endpoints.
  - Use `TestClient` from FastAPI for integration tests.
  - Use temporary database for tests (`pytest-postgresql` or SQLite in-memory).
  - Verify all tests pass in Docker: `docker-compose exec backend pytest`.

  **Must NOT do**:
  - Mock ML models entirely (at least one test should load real models).
  - Test against production database.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-21)
  - **Blocked By**: Tasks 17-21
  - **Blocks**: —

  **Acceptance Criteria**:
  - [ ] `docker-compose exec backend pytest` passes with >=60% coverage
  - [ ] All test files exist and cover happy path + error cases
  - [ ] Test runtime <5 minutes

  **QA Scenarios**:
  - **Happy Path**: `docker-compose exec backend pytest --cov=app --cov-report=term-missing` → coverage >=60%.
  - **Evidence**: `.sisyphus/evidence/task-22-coverage.txt`

- [ ] 23. Set Up React Query + Zustand State Management

  **What to do**:
  - Install `@tanstack/react-query` and `zustand`.
  - Configure React Query client with defaults (staleTime, cacheTime, refetch intervals).
  - Create `src/hooks/useAuth.ts` — login, logout, token refresh.
  - Create `src/hooks/usePredictions.ts` — fetch cohort data, predict student.
  - Create `src/stores/authStore.ts` — auth state (user, token, isAuthenticated).
  - Add API client in `src/lib/api.ts` with axios/fetch, **cookie-based auth** (httpOnly cookie sent automatically), error handling.
  - Verify hooks work in placeholder components.

  **Must NOT do**:
  - Use Redux (overkill for this scope).
  - Manually extract JWT from cookies (browser sends httpOnly cookie automatically with `credentials: 'include'`).

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-22)
  - **Blocked By**: Task 2
  - **Blocks**: Tasks 24-28

  **Acceptance Criteria**:
  - [ ] `npm run build` passes with new dependencies
  - [ ] API client sends cookies with `credentials: 'include'`
  - [ ] React Query caches cohort data
  - [ ] Zustand store updates reflect in UI components

  **QA Scenarios**:
  - **Happy Path**: Login → API request includes `Cookie: access_token=...` header automatically.
  - **Evidence**: `.sisyphus/evidence/task-23-api-cookies.png` (network tab screenshot)

- [ ] 24. Build Admin Login Page

  **What to do**:
  - Create `src/pages/LoginPage.tsx`:
    - Email + password form with validation.
    - Submit → POST `/auth/login` → server sets httpOnly cookie → redirect to dashboard.
    - Error states: invalid credentials, server error.
    - Loading state during submission.
    - Responsive design (mobile-friendly form).
  - Add route `/login` in App router.
  - Add redirect: unauthenticated users → login; authenticated → dashboard.
  - Style with Tailwind (clean, centered card layout).

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-design`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-23)
  - **Blocked By**: Tasks 2, 23
  - **Blocks**: Tasks 25-28

  **Acceptance Criteria**:
  - [ ] Login form renders correctly
  - [ ] Valid credentials → server sets httpOnly cookie, redirect to `/dashboard`
  - [ ] Invalid credentials → error message displayed
  - [ ] Responsive on mobile widths

  **QA Scenarios**:
  - **Happy Path**: Playwright → fill form → click login → assert URL is `/dashboard`.
  - **Failure**: Invalid password → assert error visible.
  - **Evidence**: `.sisyphus/evidence/task-24-login-flow.png`

- [ ] 25. Build Cohort Overview Dashboard

  **What to do**:
  - Create `src/pages/DashboardPage.tsx`:
    - Header: cohort selector dropdown, logout button.
    - Metrics cards: Total Students, At-Risk Count, At-Risk %, Avg Risk Score.
    - Chart 1: Risk distribution histogram (Recharts BarChart).
    - Chart 2: Modality contribution breakdown (Recharts PieChart or stacked bar).
    - Chart 3: Trend over time (if historical predictions exist).
    - Table: Paginated list of students (name, risk probability, risk level, last prediction date).
    - Sort by: risk probability, name.
    - Filter by: risk level (High/Medium/Low).
    - Row click → expand explanation (NLG summary).
  - Use React Query for data fetching.
  - Add loading skeletons.
  - Add error boundaries.

  **Must NOT do**:
  - Display raw SHAP values or model internals.
  - Allow editing student data from dashboard.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-design`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-24)
  - **Blocked By**: Tasks 2, 23
  - **Blocks**: Tasks 26-28

  **Acceptance Criteria**:
  - [ ] Dashboard loads with charts and table in <3s
  - [ ] Metrics cards display correct numbers from API
  - [ ] Charts render without errors
  - [ ] Table pagination works
  - [ ] Row expansion shows NLG explanation
  - [ ] Responsive layout on tablet/desktop

  **QA Scenarios**:
  - **Happy Path**: Playwright → login → dashboard loads → screenshot.
  - **Charts**: Assert Recharts SVGs present in DOM.
  - **Evidence**: `.sisyphus/evidence/task-25-dashboard.png`

- [ ] 26. Build At-Risk Student Table with Explanations

  **What to do**:
  - Extend dashboard table or create dedicated `src/pages/RiskTablePage.tsx`:
    - Sortable columns: Student Name, Risk Probability, Risk Level, Top Contributing Factor.
    - Color-coded risk badges: red (High >0.7), yellow (Medium 0.4-0.7), green (Low <0.4).
    - Expandable row: shows full NLG explanation + modality contribution bars.
    - Search by student name.
    - Export button (placeholder for v2 — shows "Coming Soon" tooltip).
    - Bulk actions (placeholder: "Send Alert" button disabled).
  - Ensure explanation text is readable (adequate font size, whitespace).

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-design`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-25)
  - **Blocked By**: Tasks 2, 23
  - **Blocks**: Tasks 27-28

  **Acceptance Criteria**:
  - [ ] Table renders 50 rows without lag
  - [ ] Risk badges have correct colors
  - [ ] Expandable explanation is human-readable
  - [ ] Search filters rows correctly
  - [ ] Sorting works on all columns

  **QA Scenarios**:
  - **Happy Path**: Playwright → sort by risk → assert highest risk first.
  - **Explanation**: Expand row → assert explanation text length >50 chars.
  - **Evidence**: `.sisyphus/evidence/task-26-risk-table.png`

- [ ] 27. Build Model Performance Dashboard

  **What to do**:
  - Create `src/pages/ModelPage.tsx`:
    - Cards: Model versions, training dates, validation metrics (F1, AUC, Precision, Recall).
    - Chart: ROC curve (Recharts LineChart or static image from training).
    - Chart: Feature importance (top 10 tabular features).
    - Table: Modality performance comparison (Text F1, Tabular F1, Behavioral F1, Fusion F1).
    - Section: Recent predictions log (last 50).
  - Fetch from `/info` and `/models` endpoints.
  - Add loading states.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-26)
  - **Blocked By**: Tasks 2, 23
  - **Blocks**: Tasks 28

  **Acceptance Criteria**:
  - [ ] Model metrics display correctly
  - [ ] ROC curve renders
  - [ ] Feature importance chart renders
  - [ ] Responsive layout

  **QA Scenarios**:
  - **Happy Path**: Playwright → navigate to `/models` → screenshot.
  - **Evidence**: `.sisyphus/evidence/task-27-model-page.png`

- [ ] 28. Write Frontend Tests (vitest)

  **What to do**:
  - Add vitest + React Testing Library + jsdom.
  - Test components:
    - `LoginPage` — form validation, submit handler.
    - `DashboardPage` — renders metrics, charts, table.
    - `RiskTable` — sorting, filtering, expansion.
    - API hooks — mock responses, error states.
  - Aim for >50% coverage.
  - Verify: `npm run test` passes.

  **Must NOT do**:
  - Test visual regression (out of scope).
  - Mock all API calls (at least one integration-style test with MSW).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-27)
  - **Blocked By**: Tasks 2, 23-27
  - **Blocks**: —

  **Acceptance Criteria**:
  - [ ] `npm run test` passes
  - [ ] Coverage >=50%
  - [ ] Test runtime <3 minutes

  **QA Scenarios**:
  - **Happy Path**: `npm run test -- --coverage` → passes.
  - **Evidence**: `.sisyphus/evidence/task-28-frontend-coverage.txt`

- [ ] 29. Create AWS Setup Guide and RDS PostgreSQL

  **What to do**:
  - Write `docs/AWS_SETUP.md` with step-by-step instructions:
    1. **AWS Account**: Create/use existing account, set up billing alerts.
     2. **IAM User**: Create `deploy-user` with programmatic access + policies:
        - `AmazonEC2FullAccess`
        - `AmazonRDSFullAccess`
        - `AmazonS3FullAccess` (for MLflow artifacts)
        - `AmazonVPCFullAccess` (for security groups)
     3. **S3 Bucket for MLflow**:
        - Create bucket `academic-prediction-mlflow-artifacts` (or similar unique name).
        - Configure IAM policy for EC2 → S3 read/write.
        - Document `MLFLOW_ARTIFACT_URI=s3://academic-prediction-mlflow-artifacts` in `.env.example`.
     4. **RDS PostgreSQL**:
       - Engine: PostgreSQL 15.
       - Instance: `db.t3.micro` (free tier).
       - Storage: 20GB.
       - Public access: NO (only from EC2 security group).
       - Create database `academic_prediction`.
       - Save credentials to AWS Secrets Manager or `.env` (never commit).
    4. **Security Groups**:
       - `rds-sg`: Inbound port 5432 from `ec2-sg` only.
       - `ec2-sg`: Inbound port 22 (SSH), 80 (HTTP), 443 (HTTPS) from anywhere (0.0.0.0/0).
    5. **CLI Verification**: `aws rds describe-db-instances` shows running instance.
  - Include AWS Console screenshots placeholders.
  - Include estimated costs: RDS ~$13/month after free tier, **EC2 ~$30/month for t3.medium** (required for DistilBERT memory).

  **Must NOT do**:
  - Use root AWS account for deployment.
  - Enable public access on RDS.
  - Hardcode credentials in documentation.

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-28)
  - **Blocked By**: Tasks 4, 5
  - **Blocks**: Tasks 30-33

  **Acceptance Criteria**:
  - [ ] `docs/AWS_SETUP.md` exists with all steps
  - [ ] RDS instance reachable from EC2 (verified via `psql` from EC2)
  - [ ] Security groups configured correctly
  - [ ] No public RDS access

  **QA Scenarios**:
  - **Happy Path**: User follows doc → RDS created and accessible.
  - **Evidence**: `.sisyphus/evidence/task-29-rds-config.txt` (psql connection output)

- [ ] 30. Create EC2 Instance and Docker Deployment

  **What to do**:
  - Write `docs/EC2_DEPLOYMENT.md`:
    1. **EC2 Launch**:
       - AMI: Ubuntu 22.04 LTS.
       - Instance: `t3.medium` (2 vCPU, 4GB RAM) — **t3.small (2GB) will OOM with DistilBERT**; t3.micro is unusable.
       - Storage: 20GB gp3.
       - Key pair: create new `.pem`, save securely.
       - Security group: `ec2-sg` from Task 29.
       - IAM role: attach role with S3 access for MLflow artifacts.
    2. **EC2 Setup**:
       - SSH: `ssh -i key.pem ubuntu@<elastic-ip>`.
       - Install Docker: `sudo apt update && sudo apt install docker.io docker-compose-plugin`.
       - Install AWS CLI v2.
       - Clone repo or SCP files.
     3. **Deploy**:
        - Copy `docker-compose.prod.yml` (production variant without dev volumes).
        - Run Alembic migrations: `docker-compose exec backend alembic upgrade head`.
        - **Document rollback procedure**: `docker-compose exec backend alembic downgrade -1` (requires all migrations to have `downgrade()` functions).
        - Create `.env` with RDS endpoint, credentials, JWT secret.
        - Run `docker-compose -f docker-compose.prod.yml up --build -d`.
        - Verify: `docker ps` shows 2+ containers.
     4. **Elastic IP**: Allocate and associate with EC2 instance.
   - Create deployment script `scripts/deploy.sh` and rollback script `scripts/rollback.sh`.

  **Guardrails**:
  - t3.medium minimum (t3.small/t3.micro will OOM with DistilBERT).
  - Elastic IP prevents IP changes on reboot.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-29)
  - **Blocked By**: Tasks 29
  - **Blocks**: Tasks 31-33

  **Acceptance Criteria**:
  - [ ] EC2 instance running and reachable via SSH
  - [ ] Docker installed and running
  - [ ] `docker-compose -f docker-compose.prod.yml up` starts backend
  - [ ] `curl http://<elastic-ip>/health` returns ok

  **QA Scenarios**:
  - **Happy Path**: `curl http://<elastic-ip>/health` → `{"status":"ok"}`.
  - **Evidence**: `.sisyphus/evidence/task-30-ec2-health.json`

- [ ] 31. Configure Nginx Reverse Proxy + SSL (Let's Encrypt)

  **What to do**:
  - Write `docs/SSL_SETUP.md`:
    1. Install nginx on EC2: `sudo apt install nginx`.
    2. Configure `nginx.conf`:
       - HTTP (port 80) → redirect to HTTPS.
       - HTTPS (port 443) → proxy to backend:8000.
       - `/mlflow` route → proxy to MLflow UI (if exposed; document security consideration).
       - Serve frontend static files from `/var/www/html`.
       - Add gzip compression.
       - Add security headers (HSTS, X-Frame-Options).
    3. **SSL Certificates**:
       - Install certbot: `sudo apt install certbot python3-certbot-nginx`.
       - Run: `sudo certbot --nginx -d yourdomain.com`.
       - Auto-renewal: `sudo certbot renew --dry-run`.
    4. **Domain**: Recommend using AWS Route 53 or existing domain. If no domain, use Elastic IP + self-signed cert (document for dev only).
  - Create `nginx/nginx.conf` template in repo.
  - Verify HTTPS works and SSL Labs rating >= B.

  **Must NOT do**:
  - Serve over HTTP in production (must redirect to HTTPS).
  - Use self-signed certs in production (Let's Encrypt only).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-30)
  - **Blocked By**: Task 30
  - **Blocks**: Tasks 32-33

  **Acceptance Criteria**:
  - [ ] `http://<ip>` redirects to `https://<domain>`
  - [ ] `https://<domain>/health` returns ok
  - [ ] SSL Labs scan shows valid certificate
  - [ ] Auto-renewal cron job configured

  **QA Scenarios**:
  - **Happy Path**: `curl -I http://<ip>` → 301 to HTTPS.
  - **SSL**: `curl -v https://<domain>` → certificate valid.
  - **Evidence**: `.sisyphus/evidence/task-31-ssl-check.txt`

- [ ] 32. Environment Configuration and Secrets Management

  **What to do**:
  - Verify `backend/app/core/config.py` from Task 3 has all production settings:
    - `DATABASE_URL` (RDS connection string).
    - `JWT_SECRET_KEY` (generate strong random string).
    - `JWT_ALGORITHM` (HS256).
    - `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (60 * 24 = 1 day).
    - `MLFLOW_TRACKING_URI`.
    - `AWS_S3_BUCKET` (for MLflow artifacts, optional).
    - `ENVIRONMENT` (local/staging/production).
  - Verify `.env.example` exists with placeholder values.
  - Verify `scripts/generate_secrets.py` from Task 3 works.
  - Document production secrets setup in `docs/SECRETS.md`.
  - Add validation: app refuses to start if required secrets missing.

  **Must NOT do**:
  - Commit `.env` or any file with real secrets to git.
  - Use weak JWT secrets (<32 chars).
  - Hardcode any credentials in source code.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-31)
  - **Blocked By**: Tasks 3, 29
  - **Blocks**: Task 33

  **Acceptance Criteria**:
  - [ ] `python -c "from app.core.config import settings; print(settings.DATABASE_URL)"` loads from env
  - [ ] App raises error if `JWT_SECRET_KEY` missing
  - [ ] `.env.example` exists and is committed
  - [ ] Real `.env` is gitignored

  **QA Scenarios**:
  - **Missing secret**: Temporarily rename `.env` → app startup fails with clear error.
  - **Evidence**: `.sisyphus/evidence/task-32-secrets-validation.txt`

- [ ] 32.5. Set Up CloudWatch Logging and Basic Monitoring

  **What to do**:
  - Configure structured JSON logging in FastAPI using `python-json-logger`:
    - Log format: timestamp, level, request_id, endpoint, response_time, user_id.
    - Log levels: INFO for requests, WARNING for slow responses, ERROR for exceptions.
  - Add `psutil`-based system metrics to `/health` endpoint: CPU %, memory %, disk usage.
  - Install and configure CloudWatch agent on EC2:
    - Stream application logs to CloudWatch Logs group `/academic-prediction/app`.
    - Stream system metrics (CPU, memory) to CloudWatch Metrics.
  - Create basic CloudWatch alarm: alert if `/health` returns non-200 for >5 minutes.
  - Document monitoring setup in `docs/MONITORING.md`.

  **Must NOT do**:
  - Use third-party monitoring SaaS (Datadog, New Relic) — stick to AWS native.
  - Log sensitive data (passwords, JWT tokens, full SHAP arrays).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-32)
  - **Blocked By**: Tasks 30, 32
  - **Blocks**: Task 33

  **Acceptance Criteria**:
  - [ ] Application logs appear in CloudWatch Logs
  - [ ] System metrics visible in CloudWatch Metrics
  - [ ] `/health` endpoint includes CPU/memory usage
  - [ ] CloudWatch alarm configured for health check failures

  **QA Scenarios**:
  - **Happy Path**: SSH to EC2 → `aws logs tail /academic-prediction/app` → logs streaming.
  - **Evidence**: `.sisyphus/evidence/task-32-5-cloudwatch-logs.txt`

- [ ] 33. End-to-End Integration Test on AWS

  **What to do**:
  - Perform full integration test on deployed AWS instance:
    1. Login via dashboard → JWT obtained.
    2. View cohort overview → charts render, metrics load.
    3. Click "Predict" for a student → prediction returns in <2s.
    4. View explanation → NLG summary is human-readable.
    5. Check model performance page → metrics display.
    6. Verify database has prediction records.
    7. Verify MLflow UI accessible (if exposed, or check artifacts in S3).
    8. **Verify stubs are disabled**: `curl https://<domain>/api/stub/cohort/1` → must return 404.
  - Document any issues in `docs/DEPLOYMENT_ISSUES.md`.
  - Create rollback script `scripts/rollback.sh` (stop containers, revert to previous image).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-32)
  - **Blocked By**: Tasks 29-32, 32.5, ALL implementation tasks
  - **Blocks**: —

  **Acceptance Criteria**:
  - [ ] Full user flow works on AWS without errors
  - [ ] Prediction latency <2s from AWS
  - [ ] Dashboard loads in <3s
  - [ ] HTTPS connection secure
  - [ ] Database persists predictions
  - [ ] Stub endpoints return 404 in production (`ENVIRONMENT=production`)

  **QA Scenarios**:
  - **Happy Path**: Playwright → open `https://<domain>` → login → dashboard → screenshot.
  - **Latency**: `time curl -X POST https://<domain>/api/predict ...` → <2s.
  - **Evidence**: `.sisyphus/evidence/task-33-e2e-dashboard.png`, `.sisyphus/evidence/task-33-e2e-latency.txt`

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + `eslint` + `pytest --cov` + `docker-compose ps`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (`data`/`result`/`item`/`temp`).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Coverage [backend%/frontend%] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty cohort, invalid student_id, missing auth token. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (`git log`/`git diff`). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `chore: initialize project scaffolding` — all setup files
- **Wave 2**: `feat: add data pipeline and model training` — data + models
- **Wave 3**: `feat: add prediction API and explainability` — backend API
- **Wave 4**: `feat: add admin dashboard frontend` — frontend pages
- **Wave 5**: `docs: add AWS deployment guide and infrastructure` — deployment docs + scripts
- **Wave FINAL**: `chore: final review and cleanup` — post-verification fixes

---

## Success Criteria

### Verification Commands
```bash
# Local development
docker-compose up --build
curl http://localhost/api/health
curl -X POST http://localhost/api/predict -H "Authorization: Bearer $TOKEN" -d '{"student_id": 1}'
npm run test -- --coverage

# AWS deployment
curl https://your-domain.com/api/health
curl -X POST https://your-domain.com/api/predict -H "Authorization: Bearer $TOKEN" -d '{"student_id": 1}'
```

### Final Checklist
- [ ] All "Must Have" present and verified
- [ ] All "Must NOT Have" absent and verified
- [ ] Backend tests pass with >=60% coverage
- [ ] Frontend tests pass with >=50% coverage
- [ ] Docker compose starts all services
- [ ] AWS deployment accessible via HTTPS
- [ ] Prediction latency <2s on AWS EC2 t3.medium
- [ ] NLG explanations are human-readable

---
