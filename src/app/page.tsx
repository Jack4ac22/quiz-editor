'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { saveAs } from 'file-saver';
import { QuickEditModal } from "@/components/QuickEditModal";
import { PreviewModal } from "@/components/QuestionForm";

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
  categories?: string[];
  type: string;
  tags?: string[];
  status?: string;
  answers?: Answer[];
};


export default function HomePage() {

  const router = useRouter();
  const searchParams = useSearchParams();


  const [questions, setQuestions] = useState<Question[]>([]);
  const [filtered, setFiltered] = useState<Question[]>([]);

  const [types, setTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  // --- INIT from search params ---
  const parseMulti = (v?: string | null) => v ? v.split(',').filter(Boolean) : [];
  const [selectedTypes, setSelectedTypes] = useState<string[]>(parseMulti(searchParams.get('types')));
  const [selectedTags, setSelectedTags] = useState<string[]>(parseMulti(searchParams.get('tags')));
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(parseMulti(searchParams.get('statuses')));
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');

  // modal states
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickPreviewId, setQuickPreviewId] = useState<string | null>(null);
  const [quickEditQuestion, setQuickEditQuestion] = useState<Question | null>(null);
  const [quickPreviewQuestion, setQuickPreviewQuestion] = useState<Question | null>(null);

  const [refreshing, setRefreshing] = useState(true);

  // --- Sync URL with filter/search state ---
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (selectedStatuses.length > 0) params.set('statuses', selectedStatuses.join(','));
    if (search.trim()) params.set('search', search);

    // Only replace if params changed
    const current = searchParams.toString();
    const next = params.toString();
    if (current !== next) {
      router.replace('?' + next, { scroll: false });
    }
  }, [selectedTypes, selectedTags, selectedStatuses, search, refreshing]);


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
  }, [refreshing]);

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
  }, [search, selectedTypes, selectedTags, selectedStatuses, questions, refreshing]);

  const toggleSelection = (value: string, selected: string[], setSelected: (val: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  // Export helpers
  const exportQuestions = (toExport: Question[], suffix: string) => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 12); // e.g. 20240613_2045
    const fileName = `questions-${suffix}-${timestamp}.json`;
    const json = JSON.stringify(toExport, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, fileName);
  };

  const handleExportAll = () => exportQuestions(questions, 'all');
  const handleExportPublished = () =>
    exportQuestions(questions.filter(q => q.status === 'published'), 'published');

  const openQuickEdit = async (id: string) => {
    const res = await fetch(`/api/questions/${id}`);
    if (res.ok) {
      setQuickEditQuestion(await res.json());
      setQuickEditId(id);
    }
  };
  const closeQuickEdit = () => {
    setQuickEditId(null);
    setQuickEditQuestion(null); setRefreshing(!refreshing);

  };

  const openQuickPreview = async (id: string) => {
    const res = await fetch(`/api/questions/${id}`);
    if (res.ok) {
      setQuickPreviewQuestion(await res.json());
      setQuickPreviewId(id);
    }
  };
  const closeQuickPreview = () => {
    setQuickPreviewId(null);
    setQuickPreviewQuestion(null);
  };

  const handleQuickSave = async (updated: Question) => {
    await fetch(`/api/questions/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    closeQuickEdit();
  };
  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this question?');
    if (!confirmed) return;

    const res = await fetch(`/api/questions/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) });
    if (res.ok) {
      setRefreshing(!refreshing);
    } else {
      alert('Failed to delete question.');
    }
  };

  return (
    <main className="p-6 max-w-6xl mx-auto relative">

      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={handleExportAll}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
        >
          Export All
        </button>
        <button
          onClick={handleExportPublished}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded shadow"
        >
          Export Published Only
        </button>
      </div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex flex-wrap gap-1">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => toggleSelection(type, selectedTypes, setSelectedTypes)}
                className={`px-3 py-1 rounded border text-sm ${selectedTypes.includes(type)
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
                className={`px-3 py-1 rounded border text-sm ${selectedTags.includes(tag)
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
                className={`px-3 py-1 rounded border text-sm ${selectedStatuses.includes(s)
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
      {/* statistics */}
      <div className="mb-6 flex flex-wrap gap-4 text-black dark:text-white">
        <div>
          {/* all questions count */}
          <span className="block text-sm font-medium">All</span>
          <span className="block text-lg font-semibold ">{questions.length}</span>
        </div>
        {/* draft questions count */}
        <div>
          <span className="block text-sm font-medium ">Draft</span>
          <span className="block text-lg font-semibold ">{questions.filter((q) => q.status === 'draft').length}</span>
        </div>
        {/* translated questions count */}
        <div>
          <span className="block text-sm font-medium ">Translated</span>
          <span className="block text-lg font-semibold ">{questions.filter((q) => q.status === 'translated').length}</span>
        </div>
        {/* proofread1 questions count */}
        <div>
          <span className="block text-sm font-medium ">Proofread1</span>
          <span className="block text-lg font-semibold ">{questions.filter((q) => q.status === 'proofread1').length}</span>
        </div>
        {/* proofread2 questions count */}
        <div>
          <span className="block text-sm font-medium ">Proofread2</span>
          <span className="block text-lg font-semibold ">{questions.filter((q) => q.status === 'proofread2').length}</span>
        </div>
        {/* published questions count */}
        <div>
          <span className="block text-sm font-medium ">Published</span>
          <span className="block text-lg font-semibold ">{questions.filter((q) => q.status === 'published').length}</span>
        </div>
        {/* rejected questions count */}
        <div>
          <span className="block text-sm font-medium ">Rejected</span>
          <span className="block text-lg font-semibold ">{questions.filter((q) => q.status === 'rejected').length}</span>
        </div>
        {/* displayed questions count */}
        <div>
          <span className="block text-sm font-medium ">Displayed</span>
          <span className="block text-lg font-semibold ">{filtered.length}</span>
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
                  <button
                    onClick={() => openQuickPreview(q.id)}
                    className="text-yellow-600 hover:text-yellow-900 font-medium mr-2"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => openQuickEdit(q.id)}
                    className="text-orange-600 hover:text-orange-900 font-medium mr-2"
                  >
                    Quick Edit
                  </button>
                  <Link href={`/${q.id}`} className="text-green-600 hover:text-green-900 font-medium">
                    Visit
                  </Link>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-40" >
        {quickPreviewId && quickPreviewQuestion && (
          <PreviewModal
            question={quickPreviewQuestion}
            open={!!quickPreviewId}
            onClose={closeQuickPreview}
          />
        )}
        {quickEditId && quickEditQuestion && (
          <QuickEditModal
            questionId={quickEditId}
            open={!!quickEditId}
            onClose={closeQuickEdit}
            onSave={handleQuickSave}
          />
        )}
      </div>

    </main>
  );
}
