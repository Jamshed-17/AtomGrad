import os
import json
from sqlalchemy.orm import Session
from backend.DB import crud, schemas 
from backend.core.config import settings 

def run_seeding(db: Session):
    """
    Заполняет базу данных данными из JSON-файлов, пропуская уже существующие записи (по полю name).
    """
    path_of_data = settings.PATH_OF_DATA 
    
    if not os.path.isdir(path_of_data):
        print(f"⚠️ Seeding path not found: {path_of_data}. Skipping seeding.")
        return

    print("Starting database seeding...")
    added_count = 0 
    skipped_count = 0
    
    for filename in os.listdir(path_of_data):
        if filename.endswith('.json'):
            file_path = os.path.join(path_of_data, filename)
            
            try:
                with open(file_path, "r", encoding="utf-8") as data:
                    person = json.load(data)
                
                person_name = person['name']
                

                if crud.person_id(db, name=person_name) is not None:
                    print(f"⏩ Skipping '{person_name}'. Activist already exists.")
                    skipped_count += 1
                    continue 
                
                person_schema = schemas.PersonCreate(
                    name=person_name,
                    about=person['position'],
                    text=person['biography'],
                    photo=person['image'][2:], 
                    sourses=person['sources'],
                    autor=person.get("compliter")
                )
                
                crud.new_person(db, person_schema)
                added_count += 1
                
            except Exception as e:
                print(f"❌ Error seeding file {filename}: {e}")
                
    db.commit() 
    print(f"Database seeding finished. {added_count} activists added, {skipped_count} skipped.")