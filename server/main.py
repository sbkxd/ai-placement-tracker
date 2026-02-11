from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import ai_service
import models, schemas
from database import engine, get_db

from fastapi.middleware.cors import CORSMiddleware

from fastapi import UploadFile, File
import audio_service
import shutil
import os

# Create Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Placement Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Allow Frontend
    allow_credentials=True,
    allow_methods=["*"], # Allow all types (GET, POST, etc)
    allow_headers=["*"],
)

# --- 1. User Routes ---

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user (In real life, hash the password!)
    new_user = models.User(
        email=user.email, 
        full_name=user.full_name, 
        hashed_password=user.password + "notreallyhashed"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# --- 2. Application Routes (The Tracker Core) ---

@app.post("/applications/{user_id}", response_model=schemas.ApplicationResponse)
def add_application(user_id: int, application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    # 1. Find the user
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Create the application linked to this user
    new_app = models.Application(**application.dict(), user_id=user_id)
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@app.get("/applications/{user_id}", response_model=List[schemas.ApplicationResponse])
def get_dashboard(user_id: int, db: Session = Depends(get_db)):
    # Get all jobs this user applied to
    apps = db.query(models.Application).filter(models.Application.user_id == user_id).all()
    return apps

# --- 3. AI Interview Routes ---

@app.post("/interview/evaluate", response_model=schemas.AIResponse)
def evaluate_answer(submission: schemas.AnswerSubmission):
    # Call our AI Brain
    result = ai_service.evaluate_interview_answer(
        submission.student_answer, 
        submission.ideal_answer
    )
    
    return schemas.AIResponse(
        score=result["score"],
        feedback=result["feedback"]
    )
    
@app.post("/interview/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    # Save the uploaded file temporarily
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Analyze it
    analysis = audio_service.analyze_audio_transcription(temp_path)
    
    # Clean up file
    os.remove(temp_path)
    
    return analysis

@app.get("/questions/random-theory")
def get_random_theory(db: Session = Depends(get_db)):
    import random
    questions = db.query(models.TheoryQuestion).all()
    return random.choice(questions) if questions else {}

@app.get("/questions/random-coding")
def get_random_coding(db: Session = Depends(get_db)):
    import random
    questions = db.query(models.CodingQuestion).all()
    return random.choice(questions) if questions else {}

import resume_service

@app.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    text = resume_service.extract_text_from_pdf(temp_path)
    suggestions = resume_service.suggest_topics(text)
    
    os.remove(temp_path)
    return {"suggestions": suggestions}

@app.get("/questions/search")
def search_questions(topic: str, type: str, db: Session = Depends(get_db)):
    if type == "theory":
        # Search in subject or question text
        question = db.query(models.TheoryQuestion).filter(
            (models.TheoryQuestion.subject.ilike(f"%{topic}%")) | 
            (models.TheoryQuestion.question_text.ilike(f"%{topic}%"))
        ).first()
    else:
        # Search in title or description
        question = db.query(models.CodingQuestion).filter(
            (models.CodingQuestion.title.ilike(f"%{topic}%")) | 
            (models.CodingQuestion.description.ilike(f"%{topic}%"))
        ).first()
    
    return question or {}