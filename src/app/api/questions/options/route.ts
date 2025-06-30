import { NextResponse } from 'next/server';
import { loadQuestions } from '@/lib/questionStore';

/**
 * GET /api/options
 * Returns lists of available categories, tags, question types, and verses
 */
export async function GET() {
  try {
    const questions = await loadQuestions();

    const categorySet = new Set<string>();
    const tagSet = new Set<string>();
    const typeSet = new Set<string>();
    const verseSet = new Set<string>();

    questions.forEach((q) => {
      // Collect categories, skip null/undefined or literal "null"/"undefined"
      if (Array.isArray(q.categories)) {
        q.categories.forEach((cat) => {
          if (typeof cat === 'string') {
            const trimmed = cat.trim();
            const lower = trimmed.toLowerCase();
            if (
              trimmed &&
              lower !== 'null' &&
              lower !== 'undefined'
            ) {
              categorySet.add(trimmed);
            }
          }
        });
      }

      // Collect tags
      if (Array.isArray(q.tags)) {
        q.tags.forEach((t) => {
          if (typeof t === 'string') {
            const trimmed = t.trim();
            const lower = trimmed.toLowerCase();
            if (
              trimmed &&
              lower !== 'null' &&
              lower !== 'undefined'
            ) {
              tagSet.add(trimmed);
            }
          }
        });
      }

      // Collect types
      if (typeof q.type === 'string') {
        const trimmed = q.type.trim();
        const lower = trimmed.toLowerCase();
        if (
          trimmed &&
          lower !== 'null' &&
          lower !== 'undefined'
        ) {
          typeSet.add(trimmed);
        }
      }

      // Collect verses
      if (Array.isArray(q.verses)) {
        q.verses.forEach((v) => {
          if (typeof v === 'string') {
            var trimmed = v.trim();
            const lower = trimmed.toLowerCase();
            const split = trimmed.split('.');
            if (split.length > 1) {
              trimmed = split[0];
            }
            if (
              trimmed &&
              lower !== 'null' &&
              lower !== 'undefined'
            ) {
              verseSet.add(trimmed);
            }
          }
        });
      }
    });

    const options = {
      categories: Array.from(categorySet).sort(),
      tags: Array.from(tagSet).sort(),
      types: Array.from(typeSet).sort(),
      verses: Array.from(verseSet).sort(),
    };

    return NextResponse.json(options);
  } catch (err) {
    console.error('Failed to load question options:', err);
    return NextResponse.json(
      {
        categories: [],
        tags: [],
        types: [],
        verses: [],
        error: 'Could not load options',
      },
      { status: 500 }
    );
  }
}
