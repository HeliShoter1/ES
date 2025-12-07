from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class GenericResponse(BaseModel):
    message: str
    data: Optional[BaseModel] = None

class ListResponse(BaseModel):
    message: str
    data: List[BaseModel]