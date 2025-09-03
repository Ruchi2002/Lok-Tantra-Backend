# crud/area_crud.py

from sqlalchemy.orm import Session
from app.models.area import Area
from app.schemas.area_schema import AreaCreate, AreaUpdate


def create_area(db: Session, area_create: AreaCreate) -> Area:
    area = Area(
        name=area_create.name
        # tenant_id=area_create.tenant_id  # Commented out until database is updated
    )

    db.add(area)
    db.commit()
    db.refresh(area)
    return area


def get_area(db: Session, area_id: int) -> Area:
    return db.query(Area).filter(Area.id == area_id).first()


def get_all_areas(db: Session):
    return db.query(Area).all()


def update_area(db: Session, area_id: int, area_update: AreaUpdate) -> Area:
    area = db.query(Area).filter(Area.id == area_id).first()

    if area:
        area.name = area_update.name
        # area.tenant_id = area_update.tenant_id  # Commented out until database is updated

        db.commit()
        db.refresh(area)

    return area


def delete_area(db: Session, area_id: int):
    area = db.query(Area).filter(Area.id == area_id).first()
    if area:
        db.delete(area)
        db.commit()
