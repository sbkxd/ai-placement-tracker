"use client";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RotateCcw, Code2, Terminal, Home } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function TechnicalInterview() {
  const [questionData, setQuestionData] = useState<any>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Fetch Random Coding Question ---
  const fetchCodingQuestion = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/questions/random-coding");
      setQuestionData(res.data);
      setCode(res.data.initial_code);
      setOutput("");
    } catch (err) {
      console.error("Failed to fetch coding question.");
    }
    setLoading(false);
  };

  // --- Logic for Targeted vs Random Loading ---
  useEffect(() => {
    const target = localStorage.getItem("targetTopic");
    if (target) {
      setLoading(true);
      axios.get(`http://localhost:8000/questions/search?topic=${target}&type=coding`)
        .then(res => {
          if (res.data.id) {
            setQuestionData(res.data);
            setCode(res.data.initial_code);
          } else {
            fetchCodingQuestion();
          }
          localStorage.removeItem("targetTopic");
        })
        .catch(() => fetchCodingQuestion())
        .finally(() => setLoading(false));
    } else {
      fetchCodingQuestion();
    }
  }, []);

  // --- Execute Code via Piston API ---
  const runCode = async () => {
    setIsRunning(true);
    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: "python",
        version: "3.10.0",
        files: [{ content: code }],
      });
      setOutput(response.data.run.output || "No output");
    } catch (error) {
      setOutput("Error executing code. Check connection.");
    }
    setIsRunning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin mb-4 h-8 w-8 text-blue-500" />
        <p className="font-mono text-slate-400">Preparing Coding Environment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      {/* --- Header Navigation --- */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Home className="h-4 w-4 mr-2" /> Dashboard
            </Button>
          </Link>
          <div className="h-6 w-[1px] bg-slate-700" />
          <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
            <Code2 className="w-5 h-5" /> {questionData?.title || "Coding Challenge"}
          </h1>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchCodingQuestion} className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <RotateCcw className="h-4 w-4 mr-2" /> New Challenge
          </Button>
          <Button onClick={runCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700 text-white px-8 font-bold">
            {isRunning ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Run Code
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* --- Left Column: Problem & Instructions --- */}
        <div className="w-1/3 p-6 border-r border-slate-800 overflow-y-auto bg-slate-900/30">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Problem Statement</h2>
          <Card className="bg-slate-900 border-slate-800 mb-6">
            <CardContent className="pt-6">
              <p className="text-slate-300 leading-relaxed mb-4">
                {questionData?.description}
              </p>
            </CardContent>
          </Card>

          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Verification</h2>
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
            <p className="text-xs font-mono text-blue-400 mb-1">Expected Output for test case:</p>
            <p className="font-mono text-white text-sm">{questionData?.expected_output}</p>
          </div>
        </div>

        {/* --- Right Column: Editor & Terminal --- */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{ 
                fontSize: 16, 
                minimap: { enabled: false }, 
                padding: { top: 20 },
                automaticLayout: true
              }}
            />
          </div>
          
          <div className="h-1/3 bg-black border-t border-slate-800 p-0 flex flex-col">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Console Output</span>
            </div>
            <div className="p-4 font-mono text-sm overflow-y-auto flex-1">
              {output ? (
                <pre className={output.toLowerCase().includes("error") ? "text-red-400" : "text-green-400"}>
                  {output}
                </pre>
              ) : (
                <p className="text-slate-700 italic">{"> Execution results will appear here..."}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}