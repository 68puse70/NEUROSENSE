# NeuroSense FastAPI Backend & SQLite Telemetry Service

This package provides the FastAPI backend server and SQLite persistence database for NeuroSense.

## Features
- **FastAPI REST API**: High performance asynchronous Python API.
- **SQLite Persistent Database**: Automatic table generation and seeding for sensor configs, session records, and timestamped telemetry readings.
- **Incremental Telemetry Batching**: Ingests sensor stream frames in batch packets while recording.
- **UTC Timestamps**: Standardized ISO-8601 UTC timestamp storage.
- **Narrow CORS Security**: Configured for `http://localhost:3000`.

## Quick Start Setup

### Terminal 1: Launch FastAPI Backend Server
```bash
# Navigate to backend folder
cd backend

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI development server
python main.py
# Server running at http://127.0.0.1:8000
# OpenAPI Docs available at http://127.0.0.1:8000/docs
```

### Terminal 2: Launch React Frontend Dashboard
```bash
# Navigate to project root
cd dashboard

# Install dependencies (if not already done)
npm install

# Start Vite dev server
npm run dev
# Dashboard running at http://localhost:3000
```
