"use client";
import { useState, useEffect, useRef } from "react";
import { getApplications, addApplication, uploadResume } from "./api"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link"; 
import { Briefcase, Code, UserCircle, BarChart3, Plus, FileText, Loader2 } from "lucide-react";

export default function Dashboard() {
  const [userId] = useState<number>(1);
  const [apps, setApps] = useState<any[]>([]);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  
  // --- Resume Analysis State ---
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Ref for File Input ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getApplications(userId);
      setApps(data);
    } catch (e) {
      console.error("Backend offline");
    }
  };

  const handleAddJob = async () => {
    if (!newCompany) return;
    await addApplication(userId, newCompany, newRole);
    setNewCompany("");
    setNewRole("");
    loadDashboard();
  };

  // --- Resume Upload Handler ---
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const data = await uploadResume(file);
      setSuggestions(data.suggestions);
    } catch (err) {
      alert("Failed to analyze resume. Ensure the backend is running.");
    }
    setIsAnalyzing(false);
  };

  // --- Trigger Hidden Input ---
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* --- Header & Navigation --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Placement Tracker</h1>
            <p className="text-slate-500 text-sm">Welcome back, Bhanu</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link href="/analytics">
              <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                <BarChart3 className="mr-2 h-4 w-4" /> Analytics
              </Button>
            </Link>

            <Link href="/technical">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <Code className="mr-2 h-4 w-4" /> Coding Round
              </Button>
            </Link>

            <Link href="/interview">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <UserCircle className="mr-2 h-4 w-4" /> Mock Interview
              </Button>
            </Link>
          </div>
        </div>

        {/* --- Resume Analysis Section --- */}
        <Card className="mb-8 border-dashed border-2 border-blue-200 bg-blue-50/30">
          <CardContent className="py-10 text-center">
            {!suggestions.length ? (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-2">
                  {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText className="h-6 w-6" />}
                </div>
                <h3 className="font-bold text-slate-800 text-xl">
                  {isAnalyzing ? "AI is Reading your Resume..." : "Analyze Resume for Interview Prep"}
                </h3>
                <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                  {isAnalyzing 
                    ? "Extracting skills and matching with our technical question bank." 
                    : "Upload your PDF resume to let our AI suggest technical topics and coding challenges based on your skill set."}
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleResumeUpload} 
                />
                <Button 
                  variant="default" 
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8" 
                  onClick={triggerFileInput}
                >
                  {isAnalyzing ? "Processing..." : "Select PDF Resume"}
                </Button>
              </div>
            ) : (
              <div className="text-left max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <h3 className="font-bold text-slate-800 text-xl mb-4 flex items-center gap-2">
                  🎯 AI Recommended Topics (Click to Start)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((topic, index) => (
                    <button 
                      key={index} 
                      onClick={() => {
                        // Save the intent so the next page knows what to load
                        localStorage.setItem("targetTopic", topic);
                        // Logic: If it sounds like a coding problem, go to technical
                        const isCoding = ["Two Sum", "Factorial", "Palindrome", "Array", "Sum"].some(k => topic.includes(k));
                        window.location.href = isCoding ? "/technical" : "/interview";
                      }}
                      className="bg-white border border-blue-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all hover:bg-blue-600 hover:text-white group"
                    >
                      <span className="h-2 w-2 bg-blue-500 rounded-full group-hover:bg-white"></span>
                      <span className="font-medium text-slate-700 group-hover:text-white">{topic}</span>
                    </button>
                  ))}
                </div>
                <Button 
                  variant="link" 
                  className="mt-6 p-0 text-blue-600 hover:text-blue-800 h-auto font-semibold" 
                  onClick={() => setSuggestions([])}
                >
                  Re-upload different resume
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left Column --- */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-md sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                   <Plus className="h-5 w-5 text-blue-600" /> New Application
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Company</label>
                  <Input 
                    placeholder="e.g. Google" 
                    value={newCompany} 
                    onChange={(e) => setNewCompany(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Role</label>
                  <Input 
                    placeholder="e.g. SDE Intern" 
                    value={newRole} 
                    onChange={(e) => setNewRole(e.target.value)} 
                  />
                </div>
                <Button onClick={handleAddJob} className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-5">
                  Save Application
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* --- Right Column --- */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-slate-400" /> Recent Trackings
              </h2>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                Total: {apps.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <Briefcase className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No applications tracked yet.</p>
                </div>
              ) : (
                apps.map((app: any) => (
                  <Card key={app.id} className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-lg hover:translate-y-[-2px] bg-white">
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg text-slate-800">{app.company_name}</h3>
                      <p className="text-slate-600 mb-4 text-sm">{app.role_title}</p>
                      <div className="flex justify-between items-center">
                        <span className="inline-block text-[10px] font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full uppercase tracking-wider">
                          {app.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium tracking-tight">Active Round</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}