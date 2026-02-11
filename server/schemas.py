from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Application Schemas ---
class ApplicationBase(BaseModel):
    company_name: str
    role_title: str
    job_link: Optional[str] = None
    status: str = "Applied"  # Default status

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int
    date_applied: datetime
    user_id: int

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    applications: List[ApplicationResponse] = []

    class Config:
        from_attributes = True

# --- Interview Schemas ---
class AnswerSubmission(BaseModel):
    question: str
    ideal_answer: str
    student_answer: str

class AIResponse(BaseModel):
    score: float
    feedback: str