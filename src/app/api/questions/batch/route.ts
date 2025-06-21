// src/app/api/questions/batch/route.ts
import { NextRequest } from 'next/server';
import { loadQuestions } from '@/lib/questionStore';
import { verifyJwt } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }
  return await handleToken(token);
}

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }
  return await handleToken(token);
}

// Shared handler for both GET and POST
async function handleToken(token: string) {
  const payload = await verifyJwt(token);
  if (!payload || !payload.questionIds) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
  const allQuestions = await loadQuestions();
  const found = payload.questionIds
    .map((id: string) => allQuestions.find((q: any) => q.id === id))
    .filter(Boolean);

  return Response.json({ questions: found, criteria: payload.criteria });
}
