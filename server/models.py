from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)

    applications = relationship("Application", back_populates="owner")
    interviews = relationship("MockInterview", back_populates="student")

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    role_title = Column(String)
    job_link = Column(String, nullable=True)
    status = Column(String, default="Applied") 
    date_applied = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="applications")

class MockInterview(Base):
    __tablename__ = "mock_interviews"
    id = Column(Integer, primary_key=True, index=True)
    interview_type = Column(String)
    transcript = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    student = relationship("User", back_populates="interviews")
    
class TheoryQuestion(Base):
    __tablename__ = "theory_questions"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String) # e.g., "Operating Systems"
    question_text = Column(Text)
    ideal_answer = Column(Text)

class CodingQuestion(Base):
    __tablename__ = "coding_questions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    initial_code = Column(Text) # e.g., "def solution(n):"
    test_case_input = Column(String)
    expected_output = Column(String)

class Attempt(Base):
    __tablename__ = "attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    type = Column(String)    # "Technical" or "Mock"
    score = Column(Integer)
    subject = Column(String) # e.g., "Python" or "OS"
    date = Column(DateTime, default=func.now())