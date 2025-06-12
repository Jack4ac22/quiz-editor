// src/app/api/questions/route.ts
import { NextResponse } from 'next/server';
import { loadQuestions, saveQuestions } from '@/lib/questionStore';
import { v4 as uuidv4 } from 'uuid';

// GET /api/questions
export async function GET() {
  const questions = await loadQuestions();
  return NextResponse.json(questions);
}

// POST /api/questions
export async function POST(req: Request) {
  const body = await req.json();

  const newQuestion = {
    ...body,
    id: uuidv4(),
    status: undefined // default to draft
  };

  const questions = await loadQuestions();
  questions.push(newQuestion);
  await saveQuestions(questions);

  return NextResponse.json(newQuestion, { status: 201 });
}