// src/app/game/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Utility for cookies (simple)
function getAnswerCookie(token: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(`quiz_answers_${token}`) || '{}');
  } catch {
    return {};
  }
}
function setAnswerCookie(token: string, answers: Record<string, string>) {
  localStorage.setItem(`quiz_answers_${token}`, JSON.stringify(answers));
}

export default function GamePage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const [questions, setQuestions] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Load questions via token
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/questions/batch?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setCriteria(data.criteria);
        setLoading(false);
      });
    // Load answers from cookie
    setAnswers(getAnswerCookie(token));
  }, [token]);

  // Save answers to localStorage
  useEffect(() => {
    if (!token) return;
    setAnswerCookie(token, answers);
  }, [answers, token]);

  if (!token) {
    return (
      <div className="p-8 text-red-600 text-lg">
        No game token provided. Please start from the <a href="/game/setup" className="underline text-blue-700">setup page</a>.
      </div>
    );
  }
  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (!questions.length)
    return (
      <div className="p-8 text-lg text-red-600">
        No questions found for this game.
      </div>
    );

  const q = questions[current];

  // Save answer
  const selectAnswer = (qid: string, aid: string) => {
    // console.log(qid, ' = ', aid);
    setAnswers({ ...answers, [qid]: aid });
  };
  let score = 0;
  if (submitted) {
    score = questions.reduce((sum, q) => {
      const correct = q.answers.find((a: any) => a.isCorrect);
      return sum + (answers[q.id] === (correct?.id?.toString() ?? correct?.id) ? 1 : 0);
    }, 0);
  }

  const handleReset = async () => {
    const res = await fetch('/api/game/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria),
    });
    const { token: newToken } = await res.json();
    localStorage.removeItem(`quiz_answers_${token}`);
    router.replace(`/game?token=${newToken}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Quiz Game</h1>
      {!submitted ? (
        <>
          <div className="mb-4 text-gray-700">
            Question {current + 1} of {questions.length}
          </div>
          <div className="bg-white rounded shadow p-6 mb-4 border">
            <div className="text-lg font-semibold text-gray-900 mb-3">{q.question}</div>
            <div className="text-md text-blue-700 mb-2">{q.question_ar}</div>
            <div className="flex flex-col gap-2">
              {q.answers.map((a: any, i: number) => (
                <label
                  key={a.id}
                  className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer ${answers[q.id] === String(i)
                    ? 'bg-green-100 border-green-400'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <input
                    type="radio"
                    name={`answer-${q.id}`}
                    value={a.id}
                    checked={answers[q.id] == String(i)}
                    onChange={() => selectAnswer(q.id, (i).toString())}
                    className="accent-blue-600"
                  />
                  <span className="text-blue-700">{a.answer}</span>
                  <span className="text-blue-700">{a.answer_ar}</span>
                </label>
              ))}
            </div>
            {/* Bible verse hints */}
            {q.verses?.length > 0 && (
              <div className="mt-3">
                <div className="font-semibold text-yellow-700">Bible verses (hint):</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {q.verses.map((v: string) => (
                    <span key={v} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200 text-xs">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
              disabled={current === 0}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={() => setCurrent((c) => Math.min(c + 1, questions.length - 1))}
              disabled={current === questions.length - 1}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length !== questions.length}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded ml-auto"
            >
              Submit
            </button>
            <button
              onClick={handleReset}
              type="button"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Reset Game
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-xl font-bold text-green-700 mb-4">
            Your Score: {score} / {questions.length}
          </div>
          <div className="mb-4">
            <button
              onClick={handleReset}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Play Again (New Questions)
            </button>
          </div>
          <div>
            {questions.map((q, idx) => {
              const correct = q.answers.find((a: any) => a.isCorrect);
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === (correct?.id?.toString() ?? correct?.id);
              return (
                <div key={q.id} className="mb-6 bg-white rounded shadow p-4 border">
                  <div className="mb-1 text-gray-800 font-semibold">
                    {idx + 1}. {q.question}
                  </div>
                  <div className="mb-2 text-blue-700">{q.question_ar}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {q.answers.map((a: any) => (
                      <span
                        key={a.id}
                        className={`px-2 py-1 rounded border text-sm ${a.isCorrect
                          ? 'bg-green-200 text-green-800 border-green-300'
                          : userAnswer === String(a.id)
                            ? 'bg-red-200 text-red-800 border-red-300'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                      >
                        {a.answer} <span className="text-blue-700">{a.answer_ar}</span>
                        {a.isCorrect && <span className="ml-2 font-bold">(Correct)</span>}
                        {userAnswer === String(a.id) && !a.isCorrect && <span className="ml-2 font-bold">(Your choice)</span>}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 text-sm">
                    {isCorrect ? (
                      <span className="text-green-700 font-bold">✔ Correct</span>
                    ) : (
                      <span className="text-red-700 font-bold">✘ Incorrect</span>
                    )}
                  </div>
                  {/* Bible verse hints */}
                  {q.verses?.length > 0 && (
                    <div className="mt-3">
                      <div className="font-semibold text-yellow-700">Bible verses (hint):</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {q.verses.map((v: string) => (
                          <span key={v} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200 text-xs">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
