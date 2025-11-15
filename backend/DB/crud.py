from .models import *
from typing import List, Optional
from sqlalchemy.orm import Session
from . import models, schemas

# --- PERSONS CRUD (Refactored to accept db: Session) ---

def all_persons(db: Session, fields: List[str] = None) -> List[models.Persons]:
    """
    Выдаёт все объекты Persons из БД.
    Возвращает список объектов Models.Persons.
    """
    return db.query(models.Persons).all()

def person_id(db: Session, name: str) -> Optional[int]:
    """Возвращает id человека по его имени"""
    person = db.query(models.Persons).filter(models.Persons.name == name).first()
    return person.id if person else None
    
def one_person(db: Session, id: int) -> Optional[models.Persons]:
    """Возвращает объект Models.Persons по его ID"""
    return db.query(models.Persons).filter(models.Persons.id == id).first()
    
def new_person(db: Session, person: schemas.PersonCreate) -> models.Persons:
    """ Добавление нового человека в базу данных """
    
    add_person = models.Persons(**person.model_dump()) 
    
    db.add(add_person)
    db.commit()
    db.refresh(add_person)
    
    return add_person
    
def edit_person(db: Session, id: int, person_data: schemas.PersonCreate) -> Optional[int]:
    """
    Изменяет пользователя по ID.
    """
    person = db.query(models.Persons).filter(models.Persons.id == id).first()
    if not person:
        return None  

    update_data = person_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(person, field, value)

    db.commit()
    db.refresh(person)  
    return person.id

def delete_person(db: Session, person_id: int) -> Optional[int]:
    """Удаляет человека по ID"""
    person = db.query(models.Persons).filter(models.Persons.id == person_id).first()
    if not person:
        return None
        
    db.delete(person)
    db.commit()
    return person.id


def create_admin(db: Session, admin: schemas.AdminCreate) -> models.Admins:
    """Создаёт нового администратора"""
    db_admin = models.Admins(
        name=admin.name, 
        login=admin.login,
        is_superadmin=admin.is_superadmin 
    )
    db_admin.set_password(admin.password)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

def get_admin_by_login(db: Session, login: str) -> Optional[models.Admins]:
    """Находит админа по логину"""
    return db.query(models.Admins).filter(models.Admins.login == login).first()

def get_all_admins(db: Session) -> List[models.Admins]:
    """Возвращает список всех администраторов"""
    return db.query(models.Admins).all()

def delete_admin_by_id(db: Session, admin_id: int) -> Optional[int]:
    """Удаляет администратора по ID"""
    admin = db.query(models.Admins).filter(models.Admins.id == admin_id).first()
    if not admin:
        return None
    
    db.delete(admin)
    db.commit()
    return admin_id