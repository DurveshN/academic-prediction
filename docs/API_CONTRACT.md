# API Contract

This document defines the request and response shapes for the Academic Performance Prediction System API.

---

## Health Check

### `GET /health`

Returns the health status of the API.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Authentication

### `POST /auth/login`

Authenticate a user and receive a JWT access token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## Predictions

### `POST /predict`

Submit student features and receive an at-risk prediction with explanation.

**Request:**
```json
{
  "student_id": 42,
  "features": {
    "attendance_rate": 0.65,
    "assignment_completion": 0.45,
    "midterm_score": 58,
    "study_hours": 12,
    "participation": 0.8
  }
}
```

**Response:**
```json
{
  "student_id": 42,
  "at_risk_probability": 0.72,
  "risk_level": "high",
  "explanation": "This student is at high risk because: attendance is low (65%), assignment completion rate is below average (45%), and midterm scores are in the bottom quartile.",
  "shap_values": [
    {"feature": "attendance_rate", "value": -0.18, "description": "Attendance below 70%"},
    {"feature": "assignment_completion", "value": -0.14, "description": "Completion rate at 45%"},
    {"feature": "midterm_score", "value": -0.12, "description": "Score in bottom quartile"},
    {"feature": "study_hours", "value": 0.08, "description": "Above average study time"},
    {"feature": "participation", "value": 0.05, "description": "Active in discussions"}
  ],
  "model_version": "v1.2.0",
  "prediction_id": "pred-42-stub"
}
```

**Field Descriptions:**
- `student_id` (int): Unique identifier for the student
- `at_risk_probability` (float): Probability of being at risk (0.0 - 1.0)
- `risk_level` (string): Categorized risk level — `"low"`, `"medium"`, or `"high"`
- `explanation` (string): Natural language explanation of the prediction
- `shap_values` (array): Feature contributions to the prediction
  - `feature` (string): Feature name
  - `value` (float): SHAP value (negative = increases risk, positive = decreases risk)
  - `description` (string): Human-readable description of the feature's impact
- `model_version` (string): Version of the model used for prediction
- `prediction_id` (string): Unique identifier for this prediction

---

## Cohorts

### `GET /cohort/{id}`

Retrieve a summary of a specific cohort, including student risk distributions.

**Path Parameters:**
- `id` (int): Cohort ID

**Response:**
```json
{
  "cohort_id": 1,
  "cohort_name": "Computer Science 2024",
  "total_students": 150,
  "at_risk_count": 23,
  "risk_distribution": {
    "low": 89,
    "medium": 38,
    "high": 23
  },
  "students": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "risk_probability": 0.12,
      "risk_level": "low"
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "risk_probability": 0.45,
      "risk_level": "medium"
    },
    {
      "id": 3,
      "name": "Charlie Brown",
      "risk_probability": 0.87,
      "risk_level": "high"
    }
  ]
}
```

**Field Descriptions:**
- `cohort_id` (int): Unique identifier for the cohort
- `cohort_name` (string): Human-readable cohort name
- `total_students` (int): Total number of students in the cohort
- `at_risk_count` (int): Number of students flagged as at-risk
- `risk_distribution` (object): Count of students per risk level
  - `low` (int): Number of low-risk students
  - `medium` (int): Number of medium-risk students
  - `high` (int): Number of high-risk students
- `students` (array): List of students in the cohort
  - `id` (int): Student ID
  - `name` (string): Student full name
  - `risk_probability` (float): At-risk probability
  - `risk_level` (string): Risk level category

---

## Models

### `GET /models`

Retrieve metadata for all available ML models.

**Response:**
```json
{
  "models": [
    {
      "name": "ensemble_v1",
      "version": "1.2.0",
      "accuracy": 0.87,
      "f1_score": 0.84,
      "last_trained": "2024-03-15T10:30:00Z",
      "status": "active"
    },
    {
      "name": "tabular_only",
      "version": "1.0.5",
      "accuracy": 0.82,
      "f1_score": 0.79,
      "last_trained": "2024-02-20T14:00:00Z",
      "status": "deprecated"
    },
    {
      "name": "multimodal_v2",
      "version": "2.0.0-beta",
      "accuracy": 0.91,
      "f1_score": 0.89,
      "last_trained": "2024-04-01T09:00:00Z",
      "status": "experimental"
    }
  ]
}
```

**Field Descriptions:**
- `models` (array): List of available models
  - `name` (string): Model identifier
  - `version` (string): Semantic version of the model
  - `accuracy` (float): Model accuracy score (0.0 - 1.0)
  - `f1_score` (float): Model F1 score (0.0 - 1.0)
  - `last_trained` (string): ISO 8601 timestamp of last training
  - `status` (string): Model status — `"active"`, `"deprecated"`, or `"experimental"`

---

## Stub Endpoints (Development Only)

> **Note:** The following stub endpoints are available **only in non-production environments** (`ENVIRONMENT != "production"`). They return static mock data for frontend development.

### `GET /stub/cohort/{cohort_id}`

Returns mock cohort summary data. Same response shape as `GET /cohort/{id}`.

### `POST /stub/predict`

Returns mock prediction data. Same response shape as `POST /predict`.

### `GET /stub/models`

Returns mock model metadata. Same response shape as `GET /models`.
