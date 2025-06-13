// src/app/add/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import QuestionForm, { QuestionInput } from '@/components/QuestionForm';

export default function AddQuestionPage() {
  const router = useRouter();

  const handleCreate = async (data: QuestionInput) => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      router.push('/');
    } else {
      alert('Failed to create question.');
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add New Question</h1>
      <div className="bg-white border border-gray-300 rounded-lg shadow p-6">
        <QuestionForm onSubmit={handleCreate} />
      </div>
    </main>
  );
}
