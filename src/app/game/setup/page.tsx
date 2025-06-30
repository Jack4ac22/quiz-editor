// src/app/game/setup/page.tsx

import GameSetupForm from "@/components/GameSetupForm";

export default function SetupPage() {
  const books = [
    { code: "Gen", name: "Genesis" },
    { code: "Ex", name: "Exodus" },
    // ... add remaining books or fetch dynamically via another API
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Game Setup</h1>
      <GameSetupForm books={books} />
    </div>
  );
}
