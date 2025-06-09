import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # service_role
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

existing_mapping = supabase.table("user_mapping").select("*").execute()
existing_uuids = set(row["uuid"] for row in existing_mapping.data)

used_indices = set(
    int(row["model_user_id"].split("_")[1])
    for row in existing_mapping.data
    if "model_user_id" in row and row["model_user_id"].startswith("user_")
)

def get_next_available_index(used):
    i = 0
    while i in used:
        i += 1
    return i

auth_users = supabase.auth.admin.list_users()

new_entries = []

for user in auth_users:
    uuid = user.id

    if uuid not in existing_uuids:
        next_index = get_next_available_index(used_indices)
        model_user_id = f"user_{next_index}"
        new_entries.append({"uuid": uuid, "model_user_id": model_user_id})
        used_indices.add(next_index)

if new_entries:
    for user in new_entries:
        supabase.table("user_mapping").insert(user).execute()
    print(f"✅ Synced {len(new_entries)} new users.")
else:
    print("✅ No new users to sync.")
