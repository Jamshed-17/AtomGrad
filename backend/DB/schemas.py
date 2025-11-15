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

class PersonRead(PersonBase):
    id: int
    
    class Config:
        from_attributes = True 

# --- ADMIN SCHEMAS ---

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