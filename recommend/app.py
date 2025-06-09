from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer
import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load env variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Content-Based Hotel Recommendation Service", version="2.0")

# Allow React access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def safe_parse_amenities(amenities_data):
    """Safely parse amenities data"""
    if isinstance(amenities_data, list):
        return amenities_data
    elif isinstance(amenities_data, str):
        try:
            # Try to parse as JSON first
            if amenities_data.startswith('['):
                return json.loads(amenities_data.replace("'", '"'))
            else:
                # Split by comma if it's a comma-separated string
                return [item.strip().strip('"\'') for item in amenities_data.split(',')]
        except:
            logger.warning(f"Failed to parse amenities: {amenities_data}")
            return []
    else:
        return []

# Load and prepare hotel data
def prepare_hotel_data():
    """Improved hotel data preparation with better feature engineering"""
    try:
        # Fetch hotels from Supabase
        response = supabase.table('hotels').select('*').execute()
        hotels_data = response.data
        
        if not hotels_data:
            logger.error("No hotel data found in database!")
            return None, None, None
            
        # Convert to DataFrame
        df = pd.DataFrame(hotels_data)
        logger.info(f"Loaded {len(df)} hotels from database")
        logger.info(f"Available columns: {df.columns.tolist()}")
        
        # Clean and process amenities
        df['amenities'] = df['amenities'].apply(safe_parse_amenities)
        
        # Create feature matrix
        # Convert amenities to one-hot encoding
        amenities_list = set()
        for amenities in df['amenities']:
            if isinstance(amenities, list):
                amenities_list.update(amenities)
        
        feature_matrix = np.zeros((len(df), len(amenities_list)))
        amenities_dict = {amenity: i for i, amenity in enumerate(amenities_list)}
        
        for i, amenities in enumerate(df['amenities']):
            if isinstance(amenities, list):
                for amenity in amenities:
                    if amenity in amenities_dict:
                        feature_matrix[i, amenities_dict[amenity]] = 1
                    
        # Add other features (use available columns)
        additional_features = []
        
        if 'stars' in df.columns:
            additional_features.append(df['stars'].fillna(0))
        if 'price' in df.columns:
            additional_features.append(df['price'].fillna(0))
        if 'city' in df.columns:
            city_dummies = pd.get_dummies(df['city'])
            additional_features.extend([city_dummies[col] for col in city_dummies.columns])
        
        if additional_features:
            feature_matrix = np.column_stack([feature_matrix] + additional_features)
        
        # Calculate similarity matrix
        similarity_matrix = cosine_similarity(feature_matrix)
        
        return df, similarity_matrix
        
    except Exception as e:
        print(f"Error preparing hotel data: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None

# Initialize data
df, similarity_matrix = prepare_hotel_data()

# Helper to get hotel IDs user booked
def get_user_bookings(user_id: str):
    try:
        response = supabase.table("bookings").select("hotel_id").eq("user_id", user_id).execute()
        return [booking['hotel_id'] for booking in response.data]
    except Exception as e:
        print(f"Error getting user bookings: {str(e)}")
        return []

def get_top_rated_hotels(num_recommendations: int = 6):
    """Get top rated hotels as default recommendations"""
    try:
        # Try different rating column names
        rating_column = None
        for col in ['review_score', 'hotel_rating', 'stars', 'rating']:
            if col in df.columns:
                rating_column = col
                break
        
        if not rating_column:
            print("No rating column found, using first hotels")
            top_hotels = df.head(num_recommendations)
        else:
            top_hotels = df.nlargest(num_recommendations, rating_column)
        
        return [
            {
                "hotel_id": int(row['hotelid']),
                "name": row.get('hotel_name', row.get('name', 'Unknown Hotel')),
                "city": row.get('city', ''),
                "country": row.get('country', ''),
                "price": float(row.get('price', 0)) if pd.notnull(row.get('price')) else 0,
                "stars": float(row.get('stars', 0)) if pd.notnull(row.get('stars')) else None,
                "image_url": row.get('image_url', ''),
                "amenities": row.get('amenities', []),
                "similarity_score": None
            }
            for _, row in top_hotels.iterrows()
        ]
    except Exception as e:
        print(f"Error getting top rated hotels: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

@app.get("/recommend")
def recommend(user_id: str, num_recommendations: int = 6):
    try:
        print(f"Recommendation request for user: {user_id}")
        
        if df is None or similarity_matrix is None:
            print("Data not loaded, returning top rated hotels")
            return get_top_rated_hotels(num_recommendations)

        # Get user's bookings
        booked_ids = get_user_bookings(user_id)
        print(f"User {user_id} has booked: {booked_ids}")
        
        if not booked_ids:
            print("No bookings found, returning top rated hotels")
            return get_top_rated_hotels(num_recommendations)

        # Convert to proper format for comparison
        booked_ids = [str(id) for id in booked_ids]

        # Get indices of booked hotels
        booked_indices = df[df['hotelid'].astype(str).isin(booked_ids)].index.tolist()
        print(f"Found booked indices: {booked_indices}")
        
        if not booked_indices:
            print("No matching hotels found in dataset, returning top rated")
            return get_top_rated_hotels(num_recommendations)

        # Calculate average similarity scores
        similarity_scores = similarity_matrix[booked_indices].mean(axis=0)
        
        # Get indices of top similar hotels
        similar_indices = similarity_scores.argsort()[::-1]
        
        # Remove booked hotels
        similar_indices = [idx for idx in similar_indices if idx not in booked_indices]
        
        # Get recommendations
        recommendations = []
        for idx in similar_indices[:num_recommendations]:
            hotel = df.iloc[idx]
            recommendations.append({
                "hotel_id": int(hotel['hotelid']),
                "name": hotel.get('hotel_name', hotel.get('name', 'Unknown Hotel')),
                "city": hotel.get('city', ''),
                "country": hotel.get('country', ''),
                "price": float(hotel.get('price', 0)) if pd.notnull(hotel.get('price')) else 0,
                "stars": float(hotel.get('stars', 0)) if pd.notnull(hotel.get('stars')) else None,
                "image_url": hotel.get('image_url', ''),
                "amenities": hotel.get('amenities', []),
                "similarity_score": float(similarity_scores[idx])
            })
        
        print(f"Returning {len(recommendations)} recommendations")
        return recommendations

    except Exception as e:
        print(f"Error generating recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        return get_top_rated_hotels(num_recommendations)

@app.get("/refresh-data")
async def refresh_data():
    """Endpoint to refresh hotel data and similarity matrix"""
    try:
        global df, similarity_matrix
        df, similarity_matrix = prepare_hotel_data()
        return {"status": "success", "message": "Data refreshed successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Recommendation service is running",
        "data_loaded": df is not None and similarity_matrix is not None
    }