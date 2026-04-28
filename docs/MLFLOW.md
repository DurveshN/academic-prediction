# MLflow Experiment Tracking

This project uses MLflow to track experiments, parameters, metrics, and model artifacts for all machine learning training runs.

## Configuration

MLflow settings are defined in `backend/app/core/config.py`:

| Setting | Default | Description |
|---------|---------|-------------|
| `MLFLOW_TRACKING_URI` | `sqlite:///backend/mlflow.db` | SQLite database for run metadata |
| `MLFLOW_ARTIFACT_ROOT` | `backend/mlruns` | Local directory for model artifacts |

Override these via environment variables or a `.env` file.

## Starting the MLflow UI

Activate the backend virtual environment and launch the UI:

```powershell
# Windows
. backend/venv/Scripts/activate
mlflow ui --backend-store-uri sqlite:///backend/mlflow.db --default-artifact-root backend/mlruns --port 5000
```

```bash
# macOS/Linux
source backend/venv/bin/activate
mlflow ui --backend-store-uri sqlite:///backend/mlflow.db --default-artifact-root backend/mlruns --port 5000
```

Open http://localhost:5000 in your browser.

## Viewing Experiments

The UI organizes runs into experiments:

- `text_model` — DistilBERT classifier training runs
- `tabular_model` — XGBoost classifier training runs
- `behavioral_model` — LSTM classifier training runs
- `fusion_ensemble` — Late fusion meta-learner training runs

Click an experiment name to see all runs. Each run displays:

- **Parameters**: hyperparameters (learning rate, batch size, epochs, etc.)
- **Metrics**: validation F1, accuracy, precision, recall, ROC-AUC
- **Artifacts**: saved model files

## Comparing Runs

1. Select multiple runs using the checkboxes on the left.
2. Click **Compare**.
3. View side-by-side parameter and metric comparisons.
4. Use the chart tab to plot metrics across runs (e.g., validation F1 vs. learning rate).

## Where Artifacts Are Stored

- **Tracking database**: `backend/mlflow.db` (SQLite)
- **Model artifacts**: `backend/mlruns/<experiment_id>/<run_id>/artifacts/model/`
- **Symlinks to latest models**: `backend/models/*_latest.*`

## Programmatic Access

Use the helper functions in `backend/app/core/mlflow.py`:

```python
from app.core.mlflow import start_run, log_params, log_metrics, log_model, end_run

start_run(experiment_name="my_experiment", run_name="run_1")
log_params({"lr": 1e-4, "epochs": 20})
log_metrics({"val_f1": 0.85})
log_model("path/to/model.pt", artifact_path="model")
end_run()
```

## Notes

- Remote tracking server and PostgreSQL are **not** configured in v1 (local SQLite only).
- When deploying to AWS, update `MLFLOW_TRACKING_URI` and `MLFLOW_ARTIFACT_ROOT` to use S3 for artifact persistence.
