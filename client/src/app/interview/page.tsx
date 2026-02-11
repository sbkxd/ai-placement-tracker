"use client";
import { useState } from "react";
// We use "../api" because api.ts is one folder up (in app/)
import { evaluateAnswer } from "../api"; 
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InterviewRoom() {
  const [question] = useState("Explain the difference between a Process and a Thread.");
  const [ideal] = useState("A process is an executing program with its own memory space, while a thread is a unit of execution within a process that shares memory.");
  
  const [studentAnswer, setStudentAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await evaluateAnswer(question, ideal, studentAnswer);
      setFeedback(result);
    } catch (error) {
      alert("AI Service is offline! Make sure Python backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-400">🤖 AI Technical Round</h1>

        {/* --- The Question Card --- */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Question 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-slate-300">{question}</p>
          </CardContent>
        </Card>

        {/* --- Student Answer Area --- */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">Your Answer:</label>
          <Textarea 
            className="bg-slate-950 border-slate-700 text-white h-40"
            placeholder="Type your explanation here..."
            value={studentAnswer}
            // FIX: Added explicit type for the event 'e'
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStudentAnswer(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-lg py-6"
        >
          {loading ? "Analyzing..." : "Submit Answer"}
        </Button>

        {/* --- AI Feedback Result --- */}
        {feedback && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <Card className={`border-2 ${feedback.score > 70 ? "border-green-500 bg-green-900/20" : "border-red-500 bg-red-900/20"}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-white">AI Analysis</h3>
                  <span className="text-3xl font-black text-white">{feedback.score}/100</span>
                </div>
                <p className="text-slate-300">{feedback.feedback}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}