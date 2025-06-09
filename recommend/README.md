# TravelMate Recommendation Services

This directory contains two recommendation services:

## Services

1. **Content-Based Filtering** (`app.py`) - Port 8000

   - Recommends hotels based on user's booking history and hotel features
   - Uses cosine similarity to find similar hotels

2. **Collaborative Filtering** (`main.py`) - Port 8001
   - Recommends hotels based on what similar users liked
   - Uses NMF (Non-negative Matrix Factorization) model

## Running the Services

### Start Content-Based Service (Port 8000)

```bash
cd recommend
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Start Collaborative Filtering Service (Port 8001)

```bash
cd recommend
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## Running Both Services Simultaneously

You can run both services at the same time in separate terminal windows:

**Terminal 1:**

```bash
cd recommend
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2:**

```bash
cd recommend
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## API Endpoints

### Content-Based Service (8000)

- `GET /recommend?user_id={uuid}&num_recommendations=6` - Get content-based recommendations
- `GET /health` - Health check
- `GET /refresh-data` - Refresh hotel data

### Collaborative Filtering Service (8001)

- `GET /recommend/{user_id}?top_n=5` - Get collaborative recommendations by model user ID
- `GET /recommend_by_uuid/{uuid}?top_n=5` - Get collaborative recommendations by user UUID

## Frontend Integration

The React frontend now includes both recommendation systems:

- **Smart Recommendations** (Blue theme) - Content-based filtering
- **Community Recommendations** (Purple theme) - Collaborative filtering

Both components are displayed on the homepage when a user is logged in.
