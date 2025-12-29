from fastapi import APIRouter, Depends, HTTPException, status, Response, File, UploadFile, Form
from sqlalchemy.orm import Session
from backend.DB import crud, db, schemas
from backend.api.auth import get_current_admin
from typing import List, Optional
from uuid import uuid4
import os
import json

router = APIRouter(prefix="/admin/persons", tags=["admin-persons"])

# Директория для загрузок
UPLOAD_DIR = "backend/static/img"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=schemas.PersonRead)
async def add_person(
    name: str = Form(...),
    about: str = Form(...),
    text: str = Form(...),  # JSON строка массива
    photo: Optional[UploadFile] = File(None),
    sourses: str = Form(...),  # JSON строка массива
    autor: Optional[str] = Form(None),
    db: Session = Depends(db.get_db),
    admin_id: int = Depends(get_current_admin)
):
    """Добавляет нового деятеля с изображением (только для админов)"""
    
    filename = None
    
    # Если изображение загружено — сохраняем
    if photo:
        ext = photo.filename.split(".")[-1] if photo.filename else "jpg"
        filename = f"{uuid4()}.{ext}"  # уникальное имя файла
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as f:
            f.write(await photo.read())
    
    # Парсим JSON массивы
    try:
        text_list = json.loads(text) if text else []
        sourses_list = json.loads(sourses) if sourses else []
    except json.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
                          detail="Invalid JSON in text or sourses")
    
    # Собираем данные для записи
    person_data = schemas.PersonCreate(
        name=name,
        about=about,
        text=text_list,
        photo=f"/img/{filename}" or "",
        sourses=sourses_list,
        autor=autor
    )
    
    new_person = crud.new_person(db, person_data)
    return new_person

@router.put("/{person_id}", response_model=schemas.PersonRead)
async def update_person(
    person_id: int,
    name: Optional[str] = Form(None),
    about: Optional[str] = Form(None),
    text: Optional[str] = Form(None),  # JSON строка
    photo: Optional[UploadFile] = File(None),
    sourses: Optional[str] = Form(None),  # JSON строка
    autor: Optional[str] = Form(None),
    db: Session = Depends(db.get_db),
    admin_id: int = Depends(get_current_admin)
):
    """Обновляет данные деятеля по ID"""
    
    filename = None
    
    # Если загружено новое фото, сохраняем его
    if photo:
        ext = photo.filename.split(".")[-1] if photo.filename else "jpg"
        filename = f"{uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as f:
            f.write(await photo.read())
            
    # Парсим JSON массивы если они переданы
    text_list = None
    sourses_list = None
    
    try:
        if text is not None:
            text_list = json.loads(text)
        if sourses is not None:
            sourses_list = json.loads(sourses)
    except json.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
                          detail="Invalid JSON in text or sourses")

    # Формируем объект обновления
    # Используем exclude_none=True при создании модели или просто передаем только то, что есть
    update_data_dict = {}
    if name is not None: update_data_dict['name'] = name
    if about is not None: update_data_dict['about'] = about
    if text_list is not None: update_data_dict['text'] = text_list
    if sourses_list is not None: update_data_dict['sourses'] = sourses_list
    if autor is not None: update_data_dict['autor'] = autor
    if filename is not None: update_data_dict['photo'] = f"/img/{filename}"

    person_update = schemas.PersonUpdate(**update_data_dict)
    
    result = crud.edit_person(db, person_id, person_update)
    
    if result is None:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY, detail="Person not found or update failed")
        
    updated_person = crud.one_person(db, person_id)
    if not updated_person:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
        
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
