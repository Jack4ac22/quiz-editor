// src/lib/questionStore.ts
import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/assets/fresh.json');

export async function loadQuestions() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading questions.json:', err);
    return [];
  }
}

export async function saveQuestions(questions: any[]) {
  try {
    const json = JSON.stringify(questions, null, 2);
    await fs.writeFile(filePath, json, 'utf-8');
  } catch (err) {
    console.error('Error writing questions.json:', err);
    throw err;
  }
}
