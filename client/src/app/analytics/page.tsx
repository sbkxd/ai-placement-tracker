"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const data = [
  { name: 'Day 1', score: 40 },
  { name: 'Day 2', score: 55 },
  { name: 'Day 3', score: 48 },
  { name: 'Day 4', score: 70 },
  { name: 'Day 5', score: 85 },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
          <Link href="/"><Button variant="outline">← Dashboard</Button></Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card><CardHeader><CardTitle className="text-sm">Avg. Score</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">62%</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Interviews Done</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">12</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Top Category</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-purple-600">Python</p></CardContent></Card>
        </div>

        <Card className="p-6 bg-white">
          <CardHeader><CardTitle>Improvement Over Time</CardTitle></CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}