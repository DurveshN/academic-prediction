# Secrets Management Guide

This guide covers how to manage environment variables and secrets for the Academic Performance Prediction System.

---

## Required Environment Variables

The following variables must be set in your `.env` file before starting the application:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | RDS PostgreSQL connection string | `postgresql+asyncpg://dbadmin:password@host:5432/postgres` |
| `JWT_SECRET_KEY` | Secret key for JWT token signing | 64+ character random string |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry time | `1440` (24 hours) |
| `MLFLOW_TRACKING_URI` | MLflow tracking server URL | `http://localhost:5000` |
| `ENVIRONMENT` | Deployment environment | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourdomain.com` |

## Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_S3_BUCKET` | S3 bucket for MLflow artifacts | (empty) |
| `MLFLOW_ARTIFACT_ROOT` | Local path for MLflow artifacts | `backend/mlruns` |

---

## Generating Secrets

### JWT Secret Key

Use the provided script to generate a secure JWT secret:

```bash
python scripts/generate_secrets.py
```

This outputs a 64-character random string. Copy this into your `.env` file:

```bash
JWT_SECRET_KEY=your-generated-secret-here
```

**Requirements:**
- Minimum 32 characters
- Must not be the default placeholder value
- Use only alphanumeric characters, underscores, and hyphens

### Database Password

Generate a strong database password:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Setting Up `.env` File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace all placeholder values with real credentials.

3. **Never commit `.env` to git.** It is already in `.gitignore`.

---

## Validation

The application validates secrets on startup:

- **JWT_SECRET_KEY**: Must be >= 32 characters and not a placeholder
- **DATABASE_URL**: Must not contain placeholder credentials

If validation fails, the app will exit with a clear error message.

### Test Validation

```bash
# This should fail with default values
python -c "from backend.app.core.config import settings"

# After setting proper values in .env, this should succeed
python -c "from backend.app.core.config import settings; print('OK')"
```

---

## Production Checklist

- [ ] `.env` file created from `.env.example`
- [ ] JWT_SECRET_KEY is 64+ random characters
- [ ] DATABASE_URL points to RDS instance
- [ ] ENVIRONMENT set to `production`
- [ ] FRONTEND_URL set to HTTPS domain
- [ ] `.env` is NOT committed to git
- [ ] `.env.example` IS committed to git (with placeholders)

---

## Security Best Practices

1. **Rotate secrets regularly** - especially JWT_SECRET_KEY
2. **Use AWS Secrets Manager** for production deployments
3. **Never log secrets** - the app automatically redacts them
4. **Restrict file permissions**: `chmod 600 .env`
5. **Backup `.env` securely** - store in password manager
