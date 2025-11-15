from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.DB import crud, db, models, schemas
from backend.api.auth import get_current_admin_obj 
from typing import List

router = APIRouter(prefix="/superadmin", tags=["superadmin"])


async def get_super_admin(
    admin: models.Admins = Depends(get_current_admin_obj)
) -> models.Admins:
    """Проверяет, является ли текущий аутентифицированный админ суперадмином."""
    if not admin.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )
    return admin


@router.post("/admins/", 
    response_model=schemas.AdminRead,
    summary="Создать нового админа"
)
def create_new_admin(
    admin_data: schemas.AdminCreate,
    db: Session = Depends(db.get_db),
    super_admin: models.Admins = Depends(get_super_admin)
):
    existing_admin = crud.get_admin_by_login(db, login=admin_data.login)
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login already registered"
        )
    
    new_admin = crud.create_admin(db, admin_data)
    return new_admin

@router.get("/admins/", 
    response_model=List[schemas.AdminRead],
    summary="Получить список всех админов"
)
def read_all_admins(
    db: Session = Depends(db.get_db),
    super_admin: models.Admins = Depends(get_super_admin)
):
    admins = crud.get_all_admins(db)
    return admins

@router.delete("/admins/{admin_id}", 
    summary="Удалить админа по ID"
)
def delete_admin(
    admin_id: int,
    db: Session = Depends(db.get_db),
    super_admin: models.Admins = Depends(get_super_admin)
):
    if super_admin.id == admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own superadmin account"
        )

    deleted_id = crud.delete_admin_by_id(db, admin_id)
    
    if deleted_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
        
    return {"message": f"Admin with id {deleted_id} deleted successfully"}