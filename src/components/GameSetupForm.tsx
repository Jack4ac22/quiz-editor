// src/components/GameSetupForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GameSetupFormProps {
  categories: string[];
  tags: string[];
  types: string[];
  books: { code: string; name: string }[];
}

export default function GameSetupForm({ categories, tags, types, books }: GameSetupFormProps) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [useAndLogic, setUseAndLogic] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const criteria = {
      numQuestions,
      categories: selectedCategories,
      tags: selectedTags,
      types: selectedTypes,
      books: selectedBooks,
      logic: useAndLogic ? "AND" : "OR",
    };
    try {
      const res = await fetch("/api/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria),
      });
      const { token } = await res.json();
      router.push(`/game?token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error("Failed to create game", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4">
      <div className="mb-4">
        <label htmlFor="numQuestions" className="block font-medium mb-1">Number of Questions</label>
        <input
          id="numQuestions"
          type="number"
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          className="w-full border rounded p-2"
          min={1}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Categories</label>
        <select
          multiple
          value={selectedCategories}
          onChange={(e) =>
            setSelectedCategories(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
          className="w-full border rounded p-2"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Tags</label>
        <select
          multiple
          value={selectedTags}
          onChange={(e) =>
            setSelectedTags(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
          className="w-full border rounded p-2"
        >
          {tags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Question Types</label>
        <select
          multiple
          value={selectedTypes}
          onChange={(e) =>
            setSelectedTypes(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
          className="w-full border rounded p-2"
        >
          {types.map((tp) => (
            <option key={tp} value={tp}>{tp}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Bible Books (optional)</label>
        <select
          multiple
          value={selectedBooks}
          onChange={(e) =>
            setSelectedBooks(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
          className="w-full border rounded p-2"
        >
          {books.map((book) => (
            <option key={book.code} value={book.code}>{book.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useAndLogic}
            onChange={() => setUseAndLogic((prev) => !prev)}
            className="form-checkbox"
          />
          <span>Use AND logic (uncheck for OR logic)</span>
        </label>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Start Game
      </button>
    </form>
  );
}