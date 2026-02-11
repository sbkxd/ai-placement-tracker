import whisper
import re

# Load the smallest Whisper model (fastest for hackathons)
model = whisper.load_model("base")

def analyze_audio_transcription(audio_path: str):
    # 1. Transcribe the audio file
    result = model.transcribe(audio_path)
    text = result['text'].lower()
    
    # 2. Count filler words (um, uh, like, basically)
    fillers = ["um", "uh", "ah", "like", "basically", "actually"]
    filler_count = 0
    detected_fillers = []
    
    for word in fillers:
        count = len(re.findall(rf"\b{word}\b", text))
        if count > 0:
            filler_count += count
            detected_fillers.append(f"{word} ({count}x)")
            
    # 3. Calculate "Fluency Score"
    # Simple logic: Deduct 10 points for every 3 filler words
    score = max(0, 100 - (filler_count * 3))
    
    return {
        "transcript": text,
        "filler_count": filler_count,
        "details": ", ".join(detected_fillers),
        "fluency_score": score
    }