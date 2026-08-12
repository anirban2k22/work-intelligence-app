import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

res = supabase.from("profiles").select("role, status, full_name, display_name, created_at, users(email)").execute()
print(res)
