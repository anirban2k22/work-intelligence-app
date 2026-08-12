import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Supabase credentials missing.")
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        response = supabase.table("kras").select("*").limit(1).execute()
        print("Supabase connection successful! Query response:", response)
    except Exception as e:
        print("Supabase connection failed:", e)
