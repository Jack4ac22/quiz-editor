// src/app/api/questions/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { loadQuestions, saveQuestions } from '@/lib/questionStore';
import { v4 as uuidv4 } from 'uuid';
import { stat } from 'fs';

// GET /api/questions
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const questions = await loadQuestions();
  const question = questions.find((q: any) => q.id === id);

  if (!question) {
    return Response.json({ error: 'Question not found' }, { status: 404 });
  }

  return Response.json(question);
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

// PUT /api/questions/[id]/route.ts
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const body = await req.json();

  const questions = await loadQuestions();
  const index = questions.findIndex((q: any) => q.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  questions[index] = { ...body, id };
  await saveQuestions(questions);
  return NextResponse.json(questions[index]);
}

// PATCH /api/questions/[id]/route.ts
export async function PATCH(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const updates = await req.json();

  const questions = await loadQuestions();
  const index = questions.findIndex((q: any) => q.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  questions[index] = { ...questions[index], ...updates };
  await saveQuestions(questions);
  return NextResponse.json(questions[index]);
}

// DELETE /api/questions/[id]/route.ts
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const questions = await loadQuestions();
  const filtered = questions.filter((q: any) => q.id !== id);

  if (filtered.length === questions.length) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  await saveQuestions(filtered);
  return NextResponse.json({ status: 204 });
}
