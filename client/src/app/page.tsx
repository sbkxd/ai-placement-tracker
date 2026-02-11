"use client";
import { useState, useEffect } from "react";
// We assume api.ts is in the same folder based on previous steps
import { getApplications, addApplication } from "./api"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link"; // Better for navigation than <a> tags

export default function Dashboard() {
  const [userId] = useState<number>(1);
  const [apps, setApps] = useState<any[]>([]);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");

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

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Header & Navigation --- */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">🚀 AI Placement Tracker</h1>
          <Link href="/interview">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Start Mock Interview
            </Button>
          </Link>
        </div>

        {/* --- Input Section --- */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Track Application</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input 
              placeholder="Company" 
              value={newCompany} 
              onChange={(e) => setNewCompany(e.target.value)} 
            />
            <Input 
              placeholder="Role" 
              value={newRole} 
              onChange={(e) => setNewRole(e.target.value)} 
            />
            <Button onClick={handleAddJob} className="bg-blue-600 text-white hover:bg-blue-700">
              Add
            </Button>
          </CardContent>
        </Card>

        {/* --- Application List --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.length === 0 ? (
             <p className="text-slate-500 col-span-2 text-center">No applications tracked yet.</p>
          ) : (
            apps.map((app: any) => (
              <Card key={app.id} className="border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg">{app.company_name}</h3>
                  <p className="text-slate-600">{app.role_title}</p>
                  <span className="inline-block mt-2 text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                    {app.status}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  );
}