import sys
sys.path.insert(0, '/home/ec2-user/fragrance/backend')

from app.schemas import Base
from app.database.db import engine

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")
