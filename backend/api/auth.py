from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from backend.DB import crud, db, models
from jose import jwt, JWTError
from backend.DB.schemas import AdminCreate
from backend.core.config import settings
from datetime import datetime, timedelta, timezone 
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

def create_access_token(data: dict, expires_delta: timedelta):
    """Хелпер для создания JWT токена со сроком годности"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/login")
def login(admin: AdminCreate, response: Response, db: Session = Depends(db.get_db)):
    db_admin = crud.get_admin_by_login(db, admin.login)
    
    if not db_admin or not db_admin.verify_password(admin.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": str(db_admin.id)},
        expires_delta=access_token_expires
    )
    
    response.set_cookie(
        key="access_token", 
        value=token, 
        httponly=True,
        samesite="lax",
        secure=False, 
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {"message": "Logged in"}

@router.post("/logout")
def logout(response: Response):
    """Удаляет access_token cookie"""
    response.delete_cookie(key="access_token")
    return {"message": "Logged out"}

# --- DEPENDENCIES ---

async def get_current_admin(
    request: Request, 
) -> int:
    """Проверяет access_token из cookie и возвращает ID администратора."""
    
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated (token not found)")
        
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        admin_id: Optional[str] = payload.get("sub")
        
        if admin_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials (no sub)")
        
        return int(admin_id)

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials (token invalid)")
        
async def get_current_admin_obj(
    admin_id: int = Depends(get_current_admin), 
    db: Session = Depends(db.get_db)
) -> models.Admins:
    """Получает полный объект Admin из БД."""
    admin = db.query(models.Admins).filter(models.Admins.id == admin_id).first()
    if admin is None:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    return admin