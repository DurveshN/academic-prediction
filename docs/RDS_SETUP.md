# RDS Setup Guide

This guide covers connecting your FastAPI backend to the RDS PostgreSQL instance, running database migrations with Alembic, and basic backup and monitoring.

---

## 1. Connection String Format

Your backend needs a connection string to talk to RDS. The standard format for PostgreSQL is:

```
postgresql+asyncpg://dbadmin:YOUR_PASSWORD@RDS_ENDPOINT:5432/postgres
```

Replace:

- `YOUR_PASSWORD` — the master password you set when creating the RDS instance
- `RDS_ENDPOINT` — the endpoint address from `aws rds describe-db-instances`

### Example

```
postgresql+asyncpg://dbadmin:MySecurePass123@my-postgres-db.abc123xyz.us-east-1.rds.amazonaws.com:5432/postgres
```

Store this in your environment variables, not in your code. Create a `.env` file:

```bash
DATABASE_URL=postgresql+asyncpg://dbadmin:MySecurePass123@my-postgres-db.abc123xyz.us-east-1.rds.amazonaws.com:5432/postgres
```

---

## 2. Connect from the Backend Using asyncpg

This project uses `asyncpg` for async database access with SQLAlchemy.

### Step 2.1: Install dependencies

```bash
pip install asyncpg sqlalchemy
```

### Step 2.2: Create a database engine

In your backend code (for example, `app/database.py`):

```python
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=True, future=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session
```

### Step 2.3: Test the connection

Run a quick script to confirm the backend can reach RDS:

```python
import asyncio
from app.database import engine

async def test_connection():
    async with engine.connect() as conn:
        result = await conn.execute("SELECT version();")
        print(result.scalar())

asyncio.run(test_connection())
```

If this prints the PostgreSQL version, your connection is working.

---

## 3. Alembic Migrations

Alembic handles schema changes so your database stays in sync with your SQLAlchemy models.

### Step 3.1: Install Alembic

```bash
pip install alembic
```

### Step 3.2: Initialize Alembic

```bash
alembic init alembic
```

This creates an `alembic/` directory and an `alembic.ini` file.

### Step 3.3: Configure Alembic

Edit `alembic.ini` and set the `sqlalchemy.url` line:

```ini
sqlalchemy.url = postgresql+asyncpg://dbadmin:MySecurePass123@my-postgres-db.abc123xyz.us-east-1.rds.amazonaws.com:5432/postgres
```

Or, better, point it to your environment variable. In `alembic/env.py`, replace the `config.get_main_option` block with:

```python
import os
from app.database import engine

config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))
```

### Step 3.4: Create your first migration

After defining your SQLAlchemy models, generate a migration:

```bash
alembic revision --autogenerate -m "initial schema"
```

### Step 3.5: Apply the migration

```bash
alembic upgrade head
```

### Step 3.6: Common Alembic commands

| Command | What it does |
|---------|--------------|
| `alembic revision --autogenerate -m "message"` | Create a new migration from model changes |
| `alembic upgrade head` | Apply all pending migrations |
| `alembic downgrade -1` | Roll back one migration |
| `alembic current` | Show the current migration version |
| `alembic history` | Show full migration history |

---

## 4. Backup and Monitoring Basics

### Automated Backups

RDS creates automated backups daily if you set a backup retention period. You configured this with `--backup-retention-period 7` during setup. These backups are stored in S3 and do not count against your storage costs.

To verify backup settings:

```bash
aws rds describe-db-instances \
  --db-instance-identifier my-postgres-db \
  --query 'DBInstances[0].BackupRetentionPeriod'
```

### Manual Snapshots

Before major changes, create a manual snapshot:

```bash
aws rds create-db-snapshot \
  --db-instance-identifier my-postgres-db \
  --db-snapshot-identifier my-postgres-db-pre-migration-$(date +%Y%m%d)
```

List your snapshots:

```bash
aws rds describe-db-snapshots --db-instance-identifier my-postgres-db
```

### Restore from a Snapshot

If something goes wrong, restore to a new instance:

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier my-postgres-db-restored \
  --db-snapshot-identifier my-postgres-db-pre-migration-20240101
```

### Basic Monitoring

Check instance health from the CLI:

```bash
# CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=my-postgres-db \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average

# Free storage space
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name FreeStorageSpace \
  --dimensions Name=DBInstanceIdentifier,Value=my-postgres-db \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

You can also view metrics in the AWS Management Console under **RDS > Databases > Monitoring**.

### Alarms

Set a CloudWatch alarm to alert you when CPU or storage is high. This example sends an alert when CPU exceeds 80% for 5 minutes:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name rds-high-cpu \
  --alarm-description "CPU > 80% for 5 minutes" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=my-postgres-db
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Connect to RDS with psql | `psql -h RDS_ENDPOINT -U dbadmin -d postgres` |
| Run migrations | `alembic upgrade head` |
| Create migration | `alembic revision --autogenerate -m "message"` |
| Manual snapshot | `aws rds create-db-snapshot --db-instance-identifier my-postgres-db --db-snapshot-identifier NAME` |
| Check instance status | `aws rds describe-db-instances --db-instance-identifier my-postgres-db` |

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| Connection timeout | Security group blocks port 5432 | Verify `rds-sg` allows inbound from `ec2-sg` |
| Authentication failed | Wrong password | Check the `DATABASE_URL` password |
| Database does not exist | Wrong database name | Use `postgres` as the default database, or create one first |
| SSL required | RDS enforces SSL | Add `?ssl=require` to your connection string |

---

For the initial AWS account and infrastructure setup, see [AWS_SETUP.md](AWS_SETUP.md).
