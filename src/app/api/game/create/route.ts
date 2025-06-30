// src/app/api/game/create/route.ts 
import { NextRequest } from 'next/server';
import { signJwt } from '@/lib/jwt';
import { loadQuestions } from '@/lib/questionStore';
import { BOOK_ALIASES } from '@/lib/bible/books-aliases.js';
import { parseBibleReferenceRange } from '@/lib/bible/parsing';

// Extract canonical OSIS book code from a Bible verse reference
function getBookFromVerse(verse: string): string | null {
  const match = verse.match(/^([^.]+)/);
  if (match) {
    const book = match[1];
    for (const osis in BOOK_ALIASES) {
      if (
        osis.toLowerCase() === book.toLowerCase() ||
        (BOOK_ALIASES[osis].aliases &&
          BOOK_ALIASES[osis].aliases
            .map((a: string) => a.toLowerCase())
            .includes(book.toLowerCase()))
      ) {
        return osis;
      }
    }
  }
  return null;
}

function questionMatches(
  q: any,
  { categories, tags, types, books }: any,
  filterMode: 'AND' | 'OR'
) {
  const checks = [];
  if (categories && categories.length) {
    checks.push(q.categories?.some((c: string) => categories.includes(c)) ? 1 : 0);
  }
  if (tags && tags.length) {
    checks.push(q.tags?.some((t: string) => tags.includes(t)) ? 1 : 0);
  }
  if (types && types.length) {
    checks.push(types.includes(q.type) ? 1 : 0);
  }
  if (books && books.length) {
    const qBooks = (q.verses || [])
      .map((v: string) => getBookFromVerse(v))
      .filter(Boolean);
    checks.push(qBooks.some((b: string) => books.includes(b)) ? 1 : 0);
  }
  if (!checks.length) return true;
  return filterMode === 'AND'
    ? checks.every((v) => v === 1)
    : checks.some((v) => v === 1);
}

function pickNRandom(arr: any[], n: number): any[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  if (shuffled.length >= n) return shuffled.slice(0, n);
  return shuffled;
}

export async function POST(req: NextRequest) {
  const { count, categories, tags, types, books, filterMode } = await req.json();
  const allQuestions = await loadQuestions();

  let filtered = allQuestions.filter((q: any) =>
    questionMatches(q, { categories, tags, types, books }, filterMode || 'AND')
  );

  if (filtered.length < count) {
    const extra = allQuestions.filter(
      (q: any) => !filtered.some((fq: any) => fq.id === q.id)
    );
    filtered = [...filtered, ...pickNRandom(extra, count - filtered.length)];
  } else {
    filtered = pickNRandom(filtered, count);
  }

  const questionIds = filtered.map((q: any) => q.id);

  const payload = {
    questionIds,
    criteria: { count, categories, tags, types, books, filterMode },
    created: Date.now(),
  };
  console.log(payload.questionIds);

  const token = await signJwt(payload);

  return Response.json({ token });
}
