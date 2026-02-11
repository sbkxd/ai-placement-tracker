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

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post('/resume/upload', formData);
  return res.data;
};

export const getQuestionByTopic = async (topic: string, type: 'theory' | 'coding') => {
  const res = await api.get(`/questions/search?topic=${topic}&type=${type}`);
  return res.data;
};