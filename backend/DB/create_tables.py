from .db import engine
from .models import Base

def create_db():
    Base.metadata.create_all(engine)

if __name__ == "__main__":
    create_db()
