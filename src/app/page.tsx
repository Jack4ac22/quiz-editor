// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export type Question = {
  id: string;
  question: string;
  question_ar: string;
  type: 'Multiple Choice' | 'True or False';
  category?: string[];
  tags?: string[];
  status?: string;
};

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Quiz Questions</h1>
      <div className="overflow-auto rounded-lg shadow border border-gray-300">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-blue-100 text-blue-800 uppercase">
            <tr>
              <th className="px-4 py-3 border-b">ID</th>
              <th className="px-4 py-3 border-b">Type</th>
              <th className="px-4 py-3 border-b">Category</th>
              <th className="px-4 py-3 border-b">Tags</th>
              <th className="px-4 py-3 border-b">Status</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="odd:bg-white even:bg-gray-50 border-b hover:bg-yellow-50">
                <td className="px-4 py-2 border-b text-gray-500 font-mono">{q.id.slice(0, 8)}</td>
                <td className="px-4 py-2 border-b font-medium">{q.type}</td>
                <td className="px-4 py-2 border-b">{Array.isArray(q.category) ? q.category.join(', ') : ''}</td>
                <td className="px-4 py-2 border-b">{Array.isArray(q.tags) ? q.tags.join(', ') : ''}</td>
                <td className="px-4 py-2 border-b">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-blue-200 text-blue-800">
                    {q.status ?? 'draft'}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">
                  <Link href={`/${q.id}/edit`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
