from fastapi import APIRouter, Depends, HTTPException, status, Response, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.DB import crud, db, schemas
from backend.api.auth import get_current_admin
from backend.core.config import settings
from typing import List, Optional
from uuid import uuid4
import os

router = APIRouter(prefix="/admin/persons", tags=["admin-persons"])

@router.post("/", response_model=schemas.PersonRead)
async def add_person(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(db.get_db),
    admin_id: int = Depends(get_current_admin)
):
    """Добавляет нового деятеля с изображением (только для админов)"""

    filename = None

    # Если изображение загружено — сохраняем
    if image:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid4()}.{ext}"  # уникальное имя файла
        file_path = os.path.join(settings.UPLOAD_DIR, filename)

        with open(file_path, "wb") as f:
            f.write(await image.read())

    # Собираем данные для записи
    person_data = schemas.PersonCreate(
        name=name,
        description=description,
        image=filename
    )

    new_person = crud.new_person(db, person_data)
    return new_person

@router.put("/{person_id}", response_model=schemas.PersonRead)
def update_person(
    person_id: int,
    person_data: schemas.PersonCreate,
    db: Session = Depends(db.get_db),
    admin_id: int = Depends(get_current_admin)
):
    """Обновляет данные деятеля по ID"""
    result = crud.edit_person(db, person_id, person_data)
    
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
        
    updated_person = crud.one_person(db, person_id)
    return updated_person


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person(
    person_id: int, 
    db: Session = Depends(db.get_db),
    admin_id: int = Depends(get_current_admin)
):
    """Удаляет деятеля по ID"""
    deleted_id = crud.delete_person(db, person_id)
    
    if deleted_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)