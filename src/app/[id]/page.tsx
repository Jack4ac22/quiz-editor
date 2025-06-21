// src/app/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { QuestionInput } from '@/components/QuestionForm';

export default function DisplayQuestionPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [question, setQuestion] = useState<QuestionInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/questions/${id}`)
      .then(res => {
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) setQuestion(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (notFound || !question) return <div className="p-8 text-lg text-red-600">Question not found.</div>;

  // Reuse your PreviewModal rendering, but as a regular card, not a modal
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 relative">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">{question.question}</h2>
        <div className="text-lg text-blue-700 font-semibold mb-4">{question.question_ar}</div>
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">{question.type}</span>
          <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">{question.status}</span>
          {question.categories.map((cat) => (
            <span key={cat} className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full border border-purple-200">{cat}</span>
          ))}
          {question.tags.map((tag) => (
            <span key={tag} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200">{tag}</span>
          ))}
        </div>
        {/* Answers */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-2">
          <div className="font-semibold text-gray-700 mb-2">Answers:</div>
          <ul className="space-y-2">
            {question.answers.map((a, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="font-medium text-gray-800">{a.answer}</span>
                <span className="font-medium text-blue-600">{a.answer_ar}</span>
                {a.isCorrect && (
                  <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs font-bold ml-2">Correct</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* Verses (optional, reuse PreviewModal logic if desired) */}
        {/* ... */}
        <div className="mt-6 flex gap-4">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            onClick={() => router.push(`/${id}/edit`)}
          >
            Edit
          </button>
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            onClick={() => router.push('/')}
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}
