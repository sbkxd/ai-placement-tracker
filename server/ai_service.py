from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# 1. Load a lightweight, pre-trained model (Industry Standard for speed/accuracy balance)
# We load it globally so we don't reload it for every single request (which would be slow).
model = SentenceTransformer('all-MiniLM-L6-v2')

def evaluate_interview_answer(student_answer: str, ideal_answer: str) -> dict:
    """
    Compares the student's answer with the ideal answer using Vector Embeddings.
    Returns a score (0-100) and feedback.
    """
    
    # 2. Convert text to "Embeddings" (Lists of numbers representing meaning)
    embeddings = model.encode([student_answer, ideal_answer])
    
    # 3. Calculate Cosine Similarity (How close are the two vectors?)
    # Result is between -1 and 1. We want 0 to 1.
    score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    
    # 4. Normalize to 0-100 scale
    final_score = round(max(0, score) * 100, 2)
    
    # 5. Generate Feedback Rule-Engine
    feedback = "Good attempt."
    if final_score > 85:
        feedback = "Excellent! You covered the key concepts perfectly."
    elif final_score > 60:
        feedback = "Good, but you missed some specific technical keywords."
    else:
        feedback = "Too vague. Try to be more specific and use industry terminology."
        
    return {
        "score": final_score,
        "feedback": feedback
    }