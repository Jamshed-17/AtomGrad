from pydantic import BaseModel
from typing import Optional, List

# --- PERSON SCHEMAS ---

class PersonBase(BaseModel):
    name: str
    about: str
    text: List[str]
    photo: str
    sourses: List[str]
    autor: Optional[str] = None

class PersonCreate(PersonBase):
    pass

class PersonUpdate(BaseModel):
    name: Optional[str] = None
    about: Optional[str] = None
    text: Optional[List[str]] = None
    photo: Optional[str] = None
    sourses: Optional[List[str]] = None
    autor: Optional[str] = None

class PersonRead(PersonBase):
    id: int
    
    class Config:
        from_attributes = True 

# --- ADMIN SCHEMAS ---

class AdminLogin(BaseModel):
    """Схема для входа в систему (только login и password)"""
    login: str
    password: str

class AdminCreate(BaseModel):
    name: str
    login: str
    password: str
    is_superadmin: bool = False

class AdminRead(BaseModel):
    id: int
    name: str
    login: str
    is_superadmin: bool 
    
    class Config:
        from_attributes = True 
