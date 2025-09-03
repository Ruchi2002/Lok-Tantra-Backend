from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import get_db
from app.schemas.area_schema import AreaCreate, AreaRead, AreaUpdate
from app.crud.area_crud import (
    create_area,
    get_area,
    get_all_areas,
    update_area,
    delete_area
)

router = APIRouter(prefix="/areas", tags=["Areas"])

@router.post("/", response_model=AreaRead)
def create_area_route(area_create: AreaCreate, db: Session = Depends(get_db)):
    return create_area(db, area_create)

@router.get("/{area_id}", response_model=AreaRead)
def read_area(area_id: int, db: Session = Depends(get_db)):
    area = get_area(db, area_id)
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    return area

@router.get("/", response_model=list[AreaRead])
def get_all_areas_route(db: Session = Depends(get_db)):
    return get_all_areas(db)

@router.put("/{area_id}", response_model=AreaRead)
def update_area_route(area_id: int, area_update: AreaUpdate, db: Session = Depends(get_db)):
    area = update_area(db, area_id, area_update)
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    return area

@router.delete("/{area_id}")
def delete_area_route(area_id: int, db: Session = Depends(get_db)):
    success = delete_area(db, area_id)
    if not success:
        raise HTTPException(status_code=404, detail="Area not found")
    return {"message": "Area deleted successfully"}
