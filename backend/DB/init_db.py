import time 
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError 
from . import crud, models, db, schemas
from .db import engine
from .models import Base
from backend.core.config import settings
from .seeding import run_seeding

def create_db_and_tables(max_retries=10, retry_delay=5):
    """ 
    Создает все таблицы в БД, ожидая готовности базы данных.
    Попытается 10 раз с задержкой 5 секунд.
    """
    for i in range(max_retries):
        try:
            print(f"Attempting to connect to database... (Attempt {i+1}/{max_retries})")
            Base.metadata.create_all(engine)
            print("Database connection successful. Tables created/checked.")
            return
        except OperationalError as e:
            if i < max_retries - 1:
                print(f"Database not ready. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("Fatal: Failed to connect to the database after several retries.")
                raise e
        except Exception as e:
            print(f"An unexpected error occurred during DB initialization: {e}")
            raise e

def create_superadmin():
    db_gen = db.get_db()
    db_session = next(db_gen)
    
    try:
        admin = crud.get_admin_by_login(db_session, login=settings.SUPER_ADMIN_LOGIN)
        
        if not admin:
            print("Superadmin not found, creating...")
            admin_data = schemas.AdminCreate(
                name=settings.SUPER_ADMIN_NAME,
                login=settings.SUPER_ADMIN_LOGIN,
                password=settings.SUPER_ADMIN_PASSWORD,
                is_superadmin=True
            )
            crud.create_admin(db_session, admin_data)
            print("Superadmin created successfully.")
        else:
            print("Superadmin already exists.")
            
    finally:
        db_session.close()

def run_db_seeding():
    db_gen = db.get_db()
    db_session = next(db_gen)
    
    try:
        run_seeding(db_session) 
    finally:
        db_session.close()