from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.DB import crud, db, schemas, models
from typing import List, Optional

router = APIRouter(prefix="/persons", tags=["persons"])

@router.get("/", response_model=List[schemas.PersonRead])
def read_persons(
    db: Session = Depends(db.get_db),
):
    """
    Получает список всех деятелей.
    """
    persons = crud.all_persons(db)
    return persons 

@router.get("/{person_id}", response_model=schemas.PersonRead)
def read_person(person_id: int, db: Session = Depends(db.get_db)):
    """
    Получает всю информацию о конкретном деятеле по его ID.
    """
    db_person = crud.one_person(db, person_id)
    if db_person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    return db_person

@router.get("/id/{name}", response_model=schemas.PersonRead)
def get_person_by_name(name: str, db: Session = Depends(db.get_db)):
    """
    Ищет деятеля по имени и возвращает его полную информацию.
    """
    person_id = crud.person_id(db, name=name)
    if person_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    
    db_person = crud.one_person(db, person_id)
    
    if db_person is None: 
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
        
    return db_person