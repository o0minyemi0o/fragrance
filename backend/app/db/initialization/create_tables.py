from app.db.schema import Base
from app.db.initialization.engine import engine

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")
