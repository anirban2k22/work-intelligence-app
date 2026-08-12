import os
from supabase import create_client, Client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

email = "admin@proofx.io"
password = "AdminPassword123!"

print("Attempting to get or create admin user using Service Role Key...")
user_id = None
try:
    user_response = supabase.auth.admin.create_user({
        'email': email,
        'password': password,
        'email_confirm': True
    })
    user_id = user_response.user.id
    print(f"User created via Admin API. ID: {user_id}")
    import time
    time.sleep(1) # wait for trigger
except Exception as e:
    print(f"Creation failed (maybe already exists): {e}")
    # If already exists, we can fetch them
    # Wait, the admin API list_users is paginated, but we know the email
    users = supabase.auth.admin.list_users()
    for u in users:
        if u.email == email:
            user_id = u.id
            print(f"Found existing user. ID: {user_id}")
            # Ensure email is confirmed
            supabase.auth.admin.update_user_by_id(user_id, {"email_confirm": True, "password": password})
            print("Confirmed email and reset password just in case.")
            break

if user_id:
    # Update profile using service role key (bypasses RLS)
    try:
        update_res = supabase.table('profiles').update({'role': 'admin'}).eq('user_id', user_id).execute()
        print(f"Successfully upgraded user to admin role: {update_res}")
    except Exception as e:
        print(f"Failed to update profile: {e}")
else:
    print("Could not find or create user.")
