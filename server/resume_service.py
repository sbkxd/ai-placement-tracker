import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def suggest_topics(resume_text):
    skills_map = {
        "Python": ["Two Sum", "Factorial", "Data Structures"],
        "SQL": ["ACID Properties", "Joins", "Normalization"],
        "Operating Systems": ["Deadlocks", "Virtual Memory", "Threads"],
        "Machine Learning": ["CNNs", "Transformers", "Backpropagation"]
    }
    
    suggestions = []
    resume_text = resume_text.lower()
    for skill, topics in skills_map.items():
        if skill.lower() in resume_text:
            suggestions.extend(topics)
            
    return list(set(suggestions))[:5] # Return top 5 unique suggestions