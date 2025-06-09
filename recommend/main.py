from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pickle
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

with open("nmf_model.pkl", "rb") as f:
    model_data = pickle.load(f)

user_features = model_data["user_features"]
hotel_features = model_data["hotel_features"]
user_ids = model_data["user_ids"]
hotel_ids = model_data["hotel_ids"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/recommend/{user_id}")
def recommend_hotels(user_id: str, top_n: int = 5):
    if user_id not in user_ids:
        raise HTTPException(status_code=404, detail="User not found in model")
    
    user_index = user_ids.index(user_id)
    user_vector = user_features[user_index]
    scores = user_vector @ hotel_features
    top_indices = np.argsort(scores)[::-1][:top_n]
    recommended_hotels = [hotel_ids[i] for i in top_indices]

    return {
        "user_id": user_id,
        "recommended_hotel_ids": recommended_hotels
    }

@app.get("/recommend_by_uuid/{uuid}")
def recommend_by_uuid(uuid: str, top_n: int = 5):
    response = supabase.table("user_mapping").select("model_user_id").eq("uuid", uuid).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="User UUID not mapped to model_user_id")
    
    model_user_id = response.data[0]["model_user_id"]
    return recommend_hotels(model_user_id, top_n)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
