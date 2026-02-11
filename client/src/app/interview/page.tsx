"use client";
import { useState, useEffect } from "react";
import { evaluateAnswer } from "../api"; 
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Loader2, RotateCcw, Home } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function InterviewRoom() {
  const [questionData, setQuestionData] = useState<any>(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [audioAnalysis, setAudioAnalysis] = useState<any>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  // --- Fetch Random Question ---
  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/questions/random-theory");
      setQuestionData(res.data);
      setStudentAnswer("");
      setFeedback(null);
      setAudioAnalysis(null);
    } catch (err) {
      console.error("Failed to fetch question.");
    }
    setLoading(false);
  };

  // --- Logic for Targeted vs Random Loading ---
  useEffect(() => {
    const target = localStorage.getItem("targetTopic");
    if (target) {
      setLoading(true);
      axios.get(`http://localhost:8000/questions/search?topic=${target}&type=theory`)
        .then(res => {
          setQuestionData(res.data);
          localStorage.removeItem("targetTopic"); // Prevent re-loading on refresh
        })
        .catch(() => fetchQuestion()) // Fallback to random if search fails
        .finally(() => setLoading(false));
    } else {
      fetchQuestion();
    }
  }, []);

  // --- Audio Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        setAudioLoading(true);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("file", blob, "recording.webm");

        try {
          const res = await axios.post("http://localhost:8000/interview/analyze-audio", formData);
          setAudioAnalysis(res.data);
          setStudentAnswer(res.data.transcript);
        } catch (err) {
          alert("Error analyzing audio.");
        }
        setAudioLoading(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());
        }
      }, 10000);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const handleSubmit = async () => {
    if (!questionData) return;
    setLoading(true);
    try {
      const result = await evaluateAnswer(
        questionData.question_text, 
        questionData.ideal_answer, 
        studentAnswer
      );
      setFeedback(result);
    } catch (error) {
      alert("AI Service is offline!");
    }
    setLoading(false);
  };

  if (!questionData && loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2" /> Initializing AI Interviewer...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Home className="h-4 w-4 mr-2" /> Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-blue-400">🤖 AI Mock Interview</h1>
            </div>
            <Button variant="outline" onClick={fetchQuestion} className="border-slate-700 text-slate-400 hover:text-white">
                <RotateCcw className="mr-2 h-4 w-4" /> New Question
            </Button>
        </div>

        {/* --- The Question Card --- */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-sm uppercase tracking-widest opacity-50">
              Subject: {questionData?.subject || "General Technical"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-slate-200 font-medium">{questionData?.question_text}</p>
          </CardContent>
        </Card>

        {/* --- Audio Interaction Section --- */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            onClick={startRecording}
            disabled={isRecording || audioLoading}
            className={`${isRecording ? "bg-red-600 animate-pulse" : "bg-blue-600"} text-white px-6`}
          >
            {isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
            {isRecording ? "Listening..." : "Answer with Voice"}
          </Button>
          {audioLoading && <Loader2 className="animate-spin text-blue-400" />}
          {audioAnalysis && (
            <span className="text-sm text-green-400 font-mono">
              Fluency Score: {audioAnalysis.fluency_score}%
            </span>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2 font-mono">TRANSCRIPT / MANUAL ENTRY</label>
          <Textarea 
            className="bg-slate-950 border-slate-700 text-white h-40 focus:border-blue-500 transition-all"
            placeholder="Your answer will appear here after recording..."
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading || isRecording || !studentAnswer}
          className="w-full bg-blue-600 hover:bg-blue-500 text-lg py-6 font-bold"
        >
          {loading ? "AI is evaluating..." : "Submit Answer"}
        </Button>

        {/* --- AI Feedback Results --- */}
        {(feedback || audioAnalysis) && (
          <div className="mt-8 space-y-4">
            {feedback && (
              <Card className={`border-2 ${feedback.score > 70 ? "border-green-500 bg-green-900/10" : "border-amber-500 bg-amber-900/10"}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Content Quality</h3>
                    <div className="bg-white/10 px-4 py-1 rounded-full text-2xl font-black">{feedback.score}/100</div>
                  </div>
                  <p className="text-slate-300 italic">"{feedback.feedback}"</p>
                </CardContent>
              </Card>
            )}

            {audioAnalysis && (
              <Card className="border border-blue-500/30 bg-blue-900/10">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-blue-400 mb-2">Speech Insights</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-black/40 rounded-lg">
                      <p className="text-slate-500 mb-1 uppercase text-[10px]">Filler Words</p>
                      <p className="text-slate-200">{audioAnalysis.details || "None found!"}</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg">
                      <p className="text-slate-500 mb-1 uppercase text-[10px]">Count</p>
                      <p className="text-slate-200">{audioAnalysis.filler_count} detected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}