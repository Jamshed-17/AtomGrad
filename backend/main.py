from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from backend.api import auth, admins, persons, superadmin 
from fastapi.staticfiles import StaticFiles
from backend.DB.init_db import create_db_and_tables, create_superadmin, run_db_seeding
from backend.core.config import settings

app = FastAPI(title="AtomGrad API")


@app.on_event("startup")
def on_startup():
    print("Creating database tables...")
    create_db_and_tables() 
    
    print("Checking for superadmin...")
    create_superadmin()   
    
    print("Running database seeding...")
    run_db_seeding()
    
    print("Startup complete.")


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/img", StaticFiles(directory="backend/static/img"), name="images")


app.include_router(auth.router)
app.include_router(admins.router)
app.include_router(persons.router)
app.include_router(superadmin.router) 