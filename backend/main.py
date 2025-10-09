from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load env vars
load_dotenv()

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your Next.js domain later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Initialize both clients ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not all([SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY]):
    raise ValueError("Missing one or more Supabase environment variables.")

supabase_public: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# --- Routes ---
@app.get("/")
def root():
    return {"message": "FastAPI + Supabase connected ✅"}


@app.get("/users")
def get_users():
    """Public route (uses anon key)"""
    response = supabase_public.table("users").select("*").limit(10).execute()
    return response.data


@app.post("/admin/users")
def admin_insert_user():
    """Admin route (uses service key, bypasses RLS)"""
    response = supabase_admin.table("users").insert({"name": "AdminCreated"}).execute()
    if response.data:
        return {"status": "Inserted via service key ✅", "data": response.data}
    raise HTTPException(status_code=500, detail=response.error_message)
