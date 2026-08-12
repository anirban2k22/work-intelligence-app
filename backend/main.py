import os
from typing import List, Optional
from datetime import date
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
import tempfile

from dotenv import load_dotenv
import openai
from supabase import create_client, Client

load_dotenv()

app = FastAPI(title="ProofX Work Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # service_role key for admin ops
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

security = HTTPBearer()


def get_user_client(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Creates a per-request Supabase client authenticated as the user.
    Uses their JWT so all RLS policies apply correctly.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    token = credentials.credentials
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    client.postgrest.auth(token)

    try:
        user_response = client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = user_response.user.id
    except HTTPException:
        raise
    except Exception as e:
        print("Auth verification error:", e)
        raise HTTPException(status_code=401, detail="Authentication failed")

    return client, user_id


# ──────────────────────────────────────────
# Pydantic Schemas
# ──────────────────────────────────────────

class WorkEntrySchema(BaseModel):
    summary: str = Field(description="A concise, actionable summary of the work done.")
    details: Optional[str] = Field(default=None, description="Additional context, findings, or notes.")
    hours: float = Field(description="Estimated hours spent. Default 0.5 if unclear.")
    kra_name: Optional[str] = Field(default=None, description="Exact KRA name from the user's list. Null if no clear mapping.")
    entry_type: str = Field(description="One of: meeting, deliverable, documentation, learning, bug, feature, other")

class ExtractedWork(BaseModel):
    entries: List[WorkEntrySchema] = Field(description="List of distinct work tasks extracted from the transcript.")

class CaptureTextRequest(BaseModel):
    text: str = Field(description="The (possibly user-edited) transcript text to extract work entries from.")


# ──────────────────────────────────────────
# Helper: Extract + Save to Supabase
# ──────────────────────────────────────────

def extract_and_save(transcript: str, supabase: Client, user_id: str) -> dict:
    """Shared logic: run GPT-4o-mini extraction and save to Supabase."""

    # Fetch user's active KRAs
    try:
        kras_response = supabase.table("kras").select("id, name, description").eq("user_id", user_id).eq("is_active", True).execute()
        user_kras = kras_response.data or []
    except Exception as e:
        print("KRA fetch error:", e)
        user_kras = []

    kra_context = ""
    kra_map = {}
    if user_kras:
        kra_context = "User's active KRAs (map using EXACT names):\n"
        for kra in user_kras:
            kra_context += f"- {kra['name']}: {kra.get('description', 'No description')}\n"
            kra_map[kra['name'].lower().strip()] = kra['id']
    else:
        kra_context = "No KRAs configured yet. Leave kra_name null for all entries."

    system_prompt = f"""You are an expert work log assistant. Extract structured work entries from this spoken/written work diary.

Rules:
- Break into DISTINCT work items (one item per task/meeting/activity)
- Write clear summaries, estimate hours (default 0.5 if unclear), pick the right entry_type
- Map to KRAs using EXACT names from the list. If nothing matches, set kra_name to null
- If someone says "spent the morning on X", that is ~3-4 hours

{kra_context}
"""

    completion = openai.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Work log: {transcript}"}
        ],
        response_format=ExtractedWork
    )
    extracted = completion.choices[0].message.parsed
    print(f"Extracted {len(extracted.entries)} entries")

    # Find or create today's daily log
    today = str(date.today())
    log_response = supabase.table("daily_logs").select("id").eq("user_id", user_id).eq("log_date", today).execute()

    if log_response.data and len(log_response.data) > 0:
        daily_log_id = log_response.data[0]["id"]
    else:
        new_log = supabase.table("daily_logs").insert({
            "user_id": user_id,
            "log_date": today,
            "status": "draft"
        }).execute()
        daily_log_id = new_log.data[0]["id"]

    # Insert each work entry
    inserted = []
    for entry in extracted.entries:
        kra_id = kra_map.get(entry.kra_name.lower().strip()) if entry.kra_name else None
        try:
            result = supabase.table("work_entries").insert({
                "user_id": user_id,
                "daily_log_id": daily_log_id,
                "entry_type": entry.entry_type,
                "summary": entry.summary,
                "details": entry.details,
                "kra_id": kra_id,
                "hours": entry.hours,
                "status": "draft",
                "work_date": today,
                "is_ai_generated": True
            }).execute()
            inserted.append(result.data[0])
        except Exception as e:
            print(f"Error inserting '{entry.summary}': {e}")

    print(f"Saved {len(inserted)} entries for user {user_id}")
    return {"entries_count": len(inserted), "entries": inserted}


# ──────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "app": "ProofX"}


@app.post("/api/v1/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    auth: tuple = Depends(get_user_client),
):
    """
    Step 1 of the record workflow.
    Accepts audio, transcribes with Whisper, returns raw transcript text.
    Does NOT extract tasks or write to DB — the user edits the transcript first.
    """
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")

    _, user_id = auth  # user_id available for logging, not needed for transcription

    # Save audio to temp file
    temp_audio_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            content = await file.read()
            if len(content) == 0:
                raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")
            tmp.write(content)
            temp_audio_path = tmp.name
        print(f"Audio received: {len(content)} bytes from user {user_id}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read audio: {e}")

    # Transcribe
    try:
        with open(temp_audio_path, "rb") as audio_file:
            response = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        transcript = response
        print(f"Transcript ({len(transcript)} chars): {transcript[:120]}...")

        if not transcript or not transcript.strip():
            raise HTTPException(status_code=422, detail="No speech detected. Please speak more clearly and try again.")

        return {"transcript": transcript}

    except HTTPException:
        raise
    except Exception as e:
        print("Transcription error:", e)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)


@app.post("/api/v1/capture/text")
async def capture_text(
    request: CaptureTextRequest,
    auth: tuple = Depends(get_user_client),
):
    """
    Step 2 of the record workflow.
    Accepts the (possibly user-edited) transcript text.
    Runs GPT-4o-mini extraction, maps to KRAs, saves to Supabase.
    """
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")

    supabase, user_id = auth
    text = request.text.strip()

    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    try:
        result = extract_and_save(text, supabase, user_id)
        return result
    except Exception as e:
        print("Capture text error:", e)
        raise HTTPException(status_code=500, detail=f"Failed to extract and save: {str(e)}")


@app.post("/api/v1/capture/audio")
async def capture_audio_legacy(
    file: UploadFile = File(...),
    auth: tuple = Depends(get_user_client),
):
    """
    Legacy endpoint — transcribes AND extracts in one shot.
    Kept for backwards compatibility. Prefer the 2-step flow.
    """
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")

    supabase, user_id = auth
    temp_audio_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            content = await file.read()
            if len(content) == 0:
                raise HTTPException(status_code=400, detail="Audio file is empty.")
            tmp.write(content)
            temp_audio_path = tmp.name
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read audio: {e}")

    try:
        with open(temp_audio_path, "rb") as af:
            response = openai.audio.transcriptions.create(
                model="whisper-1", file=af, response_format="text"
            )
        transcript = response
        if not transcript or not transcript.strip():
            raise HTTPException(status_code=422, detail="No speech detected.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

    try:
        result = extract_and_save(transcript, supabase, user_id)
        result["transcript"] = transcript
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


# ──────────────────────────────────────────
# Admin Endpoints
# ──────────────────────────────────────────

class CreateUserRequest(BaseModel):
    email: str
    full_name: str
    role: str = Field(description="admin | manager | employee")
    department: Optional[str] = None
    temp_password: str = "12345678"


def get_admin_client(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify caller is admin, return a service-role client for admin operations."""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    token = credentials.credentials
    # Verify the calling user is an admin
    user_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    user_client.postgrest.auth(token)
    try:
        user_response = user_client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        caller_id = user_response.user.id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")

    # Check caller has admin role
    profile_response = user_client.table("profiles").select("role").eq("user_id", caller_id).single().execute()
    if not profile_response.data or profile_response.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Return service-role client if available, otherwise use user client
    if SUPABASE_SERVICE_KEY:
        service_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        return service_client
    return user_client


@app.post("/api/v1/admin/create-user")
async def create_user(
    request: CreateUserRequest,
    admin_client = Depends(get_admin_client),
):
    """Admin-only: Create a new user with a temporary password."""
    try:
        # Create auth user via admin API
        new_user = admin_client.auth.admin.create_user({
            "email": request.email,
            "password": request.temp_password,
            "email_confirm": True,  # Auto-confirm so they can log in immediately
            "user_metadata": {"full_name": request.full_name}
        })
        user_id = new_user.user.id

        # Create/update profile
        admin_client.table("profiles").upsert({
            "user_id": user_id,
            "full_name": request.full_name,
            "display_name": request.full_name,
            "role": request.role,
            "department": request.department,
            "status": "invited",
            "temp_password_used": True,
        }, on_conflict="user_id").execute()

        print(f"Created user {request.email} with role {request.role}")
        return {"user_id": user_id, "email": request.email, "role": request.role}

    except Exception as e:
        print(f"Create user error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

