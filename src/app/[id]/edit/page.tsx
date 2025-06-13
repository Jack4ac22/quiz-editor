'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import QuestionForm, { QuestionInput } from '@/components/QuestionForm';

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [initial, setInitial] = useState<QuestionInput | null>(null);
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
        if (data) setInitial(data);
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = async (question: QuestionInput) => {
    await fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
  };

  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (notFound) return <div className="p-8 text-lg text-red-600">Question not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Question</h1>
      {initial && (
        <QuestionForm onSubmit={handleUpdate} initial={initial} mode="edit" />
      )}
    </div>
  );
}
