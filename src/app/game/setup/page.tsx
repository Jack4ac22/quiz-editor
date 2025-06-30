// src/app/game/setup/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import GameSetupForm from "@/components/GameSetupForm";
import { loadQuestions } from "@/lib/questionStore";

export default async function SetupPage() {

  const questions = await loadQuestions();

  const categoriesSet = new Set<string>();
  const tagsSet = new Set<string>();
  const typesSet = new Set<string>();
  const versesSet = new Set<string>();

  questions.forEach((q: any) => {
    q.categories.forEach((c: string) => categoriesSet.add(c));
    q.tags.forEach((t: string) => tagsSet.add(t));
    typesSet.add(q.type);
    // q.verses.forEach((v: string) => versesSet.add(v));
  });

  const categories = Array.from(categoriesSet).sort();
  const tags = Array.from(tagsSet).sort();
  const types = Array.from(typesSet).sort();
  const verses = Array.from(versesSet).sort();
  const books = [
    // You can dynamically derive books from verses or load from a separate file
    { code: "Gen", name: "Genesis" },
    { code: "Ex", name: "Exodus" },
    // ... etc.
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Game Setup</h1>
      <GameSetupForm categories={categories} tags={tags} types={types} books={books} verses={verses} />
    </div>
  );
}
