'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export type Answer = {
  id: number;
  answer: string;
  answer_ar: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  question: string;
  question_ar: string;
  type: string;
  tags?: string[];
  status?: string;
  answers?: Answer[];
};

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filtered, setFiltered] = useState<Question[]>([]);

  const [types, setTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data: Question[]) => {
        setQuestions(data);
        setFiltered(data);

        const allTags = new Set<string>();
        const allTypes = new Set<string>();
        const allStatuses = new Set<string>();

        data.forEach((q) => {
          q.tags?.forEach((tag) => allTags.add(tag));
          allTypes.add(q.type);
          allStatuses.add(q.status ?? 'draft');
        });

        setTags(Array.from(allTags));
        setTypes(Array.from(allTypes));
        setStatuses(Array.from(allStatuses));
      });
  }, []);

  useEffect(() => {
    let data = [...questions];

    if (selectedTypes.length > 0) {
      data = data.filter((q) => selectedTypes.includes(q.type));
    }
    if (selectedTags.length > 0) {
      data = data.filter((q) => q.tags?.some((t) => selectedTags.includes(t)));
    }
    if (selectedStatuses.length > 0) {
      data = data.filter((q) => selectedStatuses.includes(q.status ?? 'draft'));
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (q) =>
          q.id?.toLowerCase().includes(s) ||
          q.question.toLowerCase().includes(s) ||
          q.question_ar.toLowerCase().includes(s) ||
          (q.answers &&
            q.answers.some(
              (a) =>
                a.answer.toLowerCase().includes(s) ||
                a.answer_ar.toLowerCase().includes(s)
            ))
      );
    }

    setFiltered(data);
  }, [search, selectedTypes, selectedTags, selectedStatuses, questions]);

  const toggleSelection = (value: string, selected: string[], setSelected: (val: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this question?');
    if (!confirmed) return;

    const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } else {
      alert('Failed to delete question.');
    }
  };

  return (
    <main className="p-6 max-w-6xl mx-auto relative">
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex flex-wrap gap-1">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => toggleSelection(type, selectedTypes, setSelectedTypes)}
                className={`px-3 py-1 rounded border text-sm ${
                  selectedTypes.includes(type)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleSelection(tag, selectedTags, setSelectedTags)}
                className={`px-3 py-1 rounded border text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <div className="flex flex-wrap gap-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => toggleSelection(s, selectedStatuses, setSelectedStatuses)}
                className={`px-3 py-1 rounded border text-sm ${
                  selectedStatuses.includes(s)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, question, answers..."
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
      </div>

      <div className="overflow-auto rounded-lg shadow border border-gray-300">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-blue-100 text-blue-800 uppercase">
            <tr>
              <th className="px-4 py-3 border-b">ID</th>
              <th className="px-4 py-3 border-b">Question</th>
              <th className="px-4 py-3 border-b">Arabic Question</th>
              <th className="px-4 py-3 border-b">Type</th>
              <th className="px-4 py-3 border-b">Tags</th>
              <th className="px-4 py-3 border-b">Status</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.id} className="odd:bg-white even:bg-gray-50 border-b hover:bg-yellow-50">
                <td className="px-4 py-2 border-b text-gray-500 font-mono">{q.id.slice(0, 8)}</td>
                <td className="px-4 py-2 border-b">{q.question}</td>
                <td className="px-4 py-2 border-b">{q.question_ar}</td>
                <td className="px-4 py-2 border-b font-medium">{q.type}</td>
                <td className="px-4 py-2 border-b">{Array.isArray(q.tags) ? q.tags.join(', ') : ''}</td>
                <td className="px-4 py-2 border-b">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-blue-200 text-blue-800">
                    {q.status ?? 'draft'}
                  </span>
                </td>
                <td className="px-4 py-2 border-b space-x-4">
                  <Link href={`/${q.id}`} className="text-green-600 hover:text-green-900 font-medium">
                    Display
                  </Link>
                  <Link href={`/${q.id}/edit`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </main>
  );
}
