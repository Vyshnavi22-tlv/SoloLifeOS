import os
import shutil
from datetime import datetime
from app.core.config import settings

def run_backup():
    print("--- SoloLife OS Database Backup Utility ---")
    db_uri = settings.SQLALCHEMY_DATABASE_URI
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join(os.path.dirname(__file__), "..", "backups")
    os.makedirs(backup_dir, exist_ok=True)

    if db_uri.startswith("sqlite"):
        # SQLite backup - copy db file
        # Default filename is typically 'sql_app.db' or similar
        db_file = db_uri.replace("sqlite:///", "")
        if not db_file or db_file == "":
            db_file = "sololifeos.db" # fallback default
        
        if os.path.exists(db_file):
            dest_file = os.path.join(backup_dir, f"sololife_backup_{timestamp}.db")
            shutil.copy2(db_file, dest_file)
            print(f"[SUCCESS] SQLite database successfully backed up to: {dest_file}")
        else:
            print(f"[ERROR] SQLite database file '{db_file}' not found at root.")
            
    elif db_uri.startswith("postgresql"):
        # Postgres backup - instruct PG command dump
        # Output shell instructions
        dest_file = os.path.join(backup_dir, f"sololife_backup_{timestamp}.sql")
        print("[INFO] PostgreSQL database detected. Execute the following CLI command to backup:")
        print(f"pg_dump {db_uri} > {dest_file}")
        print(f"[PLAN] Automated cron scheduling: '0 2 * * * pg_dump {db_uri} > {backup_dir}/sololife_backup_$(date +\\%Y\\%m\\%d).sql'")

if __name__ == "__main__":
    run_backup()
