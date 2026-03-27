"""
🗄️ Database Connection Layer
PostgreSQL connection via psycopg2 for SatyaSetu.AI
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_T2FZVyKwrjG1@ep-rapid-queen-akdht2e7-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require"
)


def get_connection():
    """Get a new database connection."""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


@contextmanager
def get_db():
    """Context manager for database connections with auto-commit/rollback."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def execute_query(query: str, params=None, fetch_one=False, fetch_all=True):
    """Execute a query and return results."""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            if fetch_one:
                return cur.fetchone()
            if fetch_all:
                return cur.fetchall()
            return None


def execute_insert(query: str, params=None):
    """Execute an insert/update and return affected row count."""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.rowcount


def execute_insert_returning(query: str, params=None):
    """Execute an insert with RETURNING clause."""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchone()


# Test connection on import
try:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
    print("✅ Database connected successfully (Neon PostgreSQL)")
except Exception as e:
    print(f"⚠️ Database connection failed: {e}")
