import { NextResponse } from 'next/server';
import {loopAndRemoveDoublications} from "@/lib/questionStore";


export async function GET() {
  await loopAndRemoveDoublications();
  return NextResponse.json({ status: 200 });
}