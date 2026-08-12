# Backend

FastAPI backend for the Work Intelligence app.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload
```

The server runs at http://localhost:8000.

## Endpoints

- `GET /health` — health check
- `GET /docs` — interactive API docs (Swagger UI)
