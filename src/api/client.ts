// 通过 Vite 代理转发到后端，避免 CORS
const BASE_URL = '/api';

export type ApiResponse<T> = {
	code: number;
	data: T;
	message: string;
};

async function handleJson<T>(res: Response): Promise<ApiResponse<T>> {
	const json = await res.json();
	if (!res.ok || json.code !== 200) {
		throw new Error(json.message || `请求失败(${res.status})`);
	}
	return json as ApiResponse<T>;
}

export async function processResume(file: File): Promise<{ pdf_text: string }> {
	const form = new FormData();
	form.append('file', file);
	const res = await fetch(`${BASE_URL}/process_resume`, {
		method: 'POST',
		body: form,
	});
	const json = await handleJson<{ pdf_text: string }>(res);
	return json.data;
}

export async function generateSelfIntroduction(payload: { job_description: string; pdf_text: string }): Promise<{ self_introduction: string }> {
	const res = await fetch(`${BASE_URL}/generate_self_introduction`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	const json = await handleJson<{ self_introduction: string }>(res);
	return json.data;
}

export async function generateInterviewOutline(payload: { job_description: string; pdf_text: string }): Promise<{ outline: string[] }> {
	const res = await fetch(`${BASE_URL}/generate_interview_outline`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	const json = await handleJson<{ outline: string[] }>(res);
	return json.data;
}

export async function generateQuestions(payload: { interview_outline_item: string }): Promise<{ questions: string[] }> {
	const res = await fetch(`${BASE_URL}/generate_questions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	const json = await handleJson<{ questions: string[] }>(res);
	return json.data;
}

export async function analyzeAnswer(payload: { question: string; user_answer: string }): Promise<{ answer_evaluation: string; standard_answer?: string }> {
	const res = await fetch(`${BASE_URL}/analyze_answer`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	const json = await handleJson<{ answer_evaluation: string; standard_answer?: string }>(res);
	return json.data;
}


