import os
from supabase import create_client, Client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

print("--- Auth Users ---")
auth_users = supabase.auth.admin.list_users()
for u in auth_users:
    print(f"{u.email} ({u.id})")

print("\n--- Public Users ---")
res = supabase.table('users').select('*').execute()
for u in res.data:
    print(u)

print("\n--- Profiles ---")
res2 = supabase.table('profiles').select('*').execute()
for p in res2.data:
    print(p)
