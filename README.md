# Multimodal Academic Performance Prediction System

A comprehensive system for predicting academic performance using multimodal data sources including academic records, behavioral patterns, and engagement metrics.

## Description

This project provides an end-to-end solution for academic performance prediction, featuring:
- **Backend**: FastAPI-based REST API with machine learning model serving
- **Frontend**: React + Vite modern web application
- **Database**: PostgreSQL for persistent data storage
- **Infrastructure**: Docker containerization for easy deployment

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, scikit-learn
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Docker Compose
- **Testing**: pytest (backend), Vitest (frontend)

## Quick Start

> **Note**: Detailed setup instructions will be added as the project develops.

### Prerequisites
- Docker and Docker Compose
- Python 3.11+
- Node.js 18+

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd academic-performance-prediction

# Start with Docker Compose (recommended)
docker-compose up -d

# Or set up manually
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   PostgreSQL    │
│  (React/Vite)   │     │   (FastAPI)     │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  ML Models      │
                        │  (scikit-learn) │
                        └─────────────────┘
```

## Project Structure

```
.
├── backend/           # FastAPI backend application
│   ├── app/          # Application code
│   ├── models/       # ML models and schemas
│   ├── data/         # Data processing utilities
│   └── tests/        # Backend tests
├── frontend/         # React frontend application
│   ├── src/          # Source code
│   └── public/       # Static assets
├── data/             # Data storage and datasets
├── docs/             # Documentation
├── scripts/          # Utility scripts
└── .sisyphus/        # Project management and evidence
```

## License

[License information to be added]
