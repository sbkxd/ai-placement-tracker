import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export const getApplications = async (userId: number) => {
  const res = await api.get(`/applications/${userId}`);
  return res.data;
};

export const addApplication = async (userId: number, company: string, role: string) => {
  const res = await api.post(`/applications/${userId}`, {
    company_name: company,
    role_title: role,
    status: "Applied"
  });
  return res.data;
};

// --- THIS WAS MISSING ---
export const evaluateAnswer = async (question: string, ideal: string, student: string) => {
  const res = await api.post('/interview/evaluate', {
    question: question,
    ideal_answer: ideal,
    student_answer: student
  });
  return res.data;
};