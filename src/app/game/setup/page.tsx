// src/app/game/setup/page.tsx

import GameSetupForm from "@/components/GameSetupForm";

export default function SetupPage() {
  // TODO: replace with real data fetching
  const categories = ["History", "Poetry", "Prophecy", "Gospels", "Acts", "Epistles"];
  const tags = ["Introduction", "Key Figures", "Events"];
  const types = ["multiple-choice", "true-false", "fill-in-the-blank"];
  const books = [
    { code: "Gen", name: "Genesis" },
    { code: "Ex", name: "Exodus" },
    { code: "Lev", name: "Leviticus" },
    // ... other books
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Game Setup</h1>
      {/* @ts-ignore */}
      <GameSetupForm categories={categories} tags={tags} types={types} books={books} />
    </div>
  );
}
