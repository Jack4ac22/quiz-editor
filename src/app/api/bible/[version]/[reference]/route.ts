import { NextRequest } from 'next/server';
import { parseBibleReferenceRange } from '@/lib/bible/parsing';
import { getVersesFromParsedReference } from '@/lib/bible/bible-references';

export async function GET(
  _req: NextRequest,
  { params }: { params: { version: string; reference: string } }
) {
  const { version, reference } = await params;

  try {
    const parsed = parseBibleReferenceRange(reference);
    const verses = getVersesFromParsedReference(parsed, version);

    if (!verses || verses.length === 0) {
      return Response.json({ error: 'Not found', text: '' }, { status: 404 });
    }

    const text = verses.map(
      (v: any) => `${v._text}`
    ).join(' ');

    return Response.json({ text });
  } catch (err: any) {
    return Response.json({ error: err.message, text: '' }, { status: 400 });
  }
}
