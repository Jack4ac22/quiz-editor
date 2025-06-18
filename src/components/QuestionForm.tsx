'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export type Answer = {
  id: number;
  answer: string;
  answer_ar: string;
  isCorrect: boolean;
};

export type QuestionInput = {
  id?: string;
  question: string;
  question_ar: string;
  type: string;
  categories: string[];
  tags: string[];
  status: string;
  verses: string[];
  answers: Answer[];
  createdAt?: string;
  updatedAt?: string;
  lastUpdateAt?: string;
  difficulty?: string;
};

type QuestionFormProps = {
  onSubmit: (data: QuestionInput) => void;
  initial?: Partial<QuestionInput>;
  mode?: 'add' | 'edit';
};

export const DEFAULT_STATUSES = [
  'draft',
  'translated',
  'proofread1',
  'proofread2',
  'published',
  'rejected',
];

export const DEFAULT_DIFFICULTIES = ['easy', 'medium', 'hard'];

// Helper: error message component
const FieldError = ({ error }: { error?: string }) =>
  error ? <div className="text-red-600 text-xs mt-1">{error}</div> : null;

interface PreviewModalProps {
  question: QuestionInput;
  onClose: () => void;
  bibleVersion?: string; // default: "AVD"
}
// Helper: Preview modal (simple overlay, not portal)
export function PreviewModal({
  question,
  onClose,
  bibleVersion = 'AVD',
}: PreviewModalProps) {
  // Store verse content and error for each verse
  const [verseContent, setVerseContent] = useState<
    Record<string, { text: string; error?: string }>
  >({});

  useEffect(() => {
    let isActive = true;

    async function fetchVerses() {
      const nextContent: Record<string, { text: string; error?: string }> = {};
      for (const v of question.verses) {
        try {
          const res = await fetch(
            `/api/bible/${bibleVersion}/${encodeURIComponent(v)}`
          );
          if (!res.ok) {
            const err = await res.json();
            nextContent[v] = {
              text: '',
              error: err.error || 'Failed to fetch verse',
            };
            continue;
          }
          const data = await res.json();
          nextContent[v] = { text: data.text || '[No content]' };
        } catch (e) {
          nextContent[v] = { text: '', error: 'Fetch error' };
        }
      }
      if (isActive) setVerseContent(nextContent);
    }
    if (question.verses.length > 0) fetchVerses();

    return () => {
      isActive = false;
    };
  }, [question.verses, bibleVersion]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center overflow-y-auto ">
      <div className="bg-white p-6 rounded-xl max-w-2xl w-full shadow-2xl border border-gray-200 relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-red-400 hover:text-blue-700 text-3xl font-bold rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Main question */}
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">{question.question}</h2>
        <div className="text-lg text-blue-700 font-semibold mb-4">{question.question_ar}</div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
            {question.type}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
            {question.status}
          </span>
          {question.categories.map((cat) => (
            <span
              key={cat}
              className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full border border-purple-200"
            >
              {cat}
            </span>
          ))}
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bible Verses Section */}
        {question.verses.length > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex flex-wrap gap-2">
              {question.verses.map((v) => (
                <span
                  key={v}
                  className="bg-yellow-100 text-yellow-800 text-lg px-3 py-1 rounded-full border border-yellow-200"
                >
                  {v}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-bold text-blue-700 mb-2">Bible Verses Content</h3>
            <ul className="space-y-4">
              {question.verses.map((v) => (
                <li key={v} className="border-l-4 border-yellow-400 pl-4">
                  <div className="text-sm font-semibold text-gray-700 mb-1">{v}</div>
                  {verseContent[v] ? (
                    verseContent[v].error ? (
                      <div className="text-red-500 text-lg italic">{verseContent[v].error}</div>
                    ) : (
                      <div className="text-blue-800 text-lg italic">{verseContent[v].text}</div>
                    )
                  ) : (
                    <div className="text-gray-400 text-lg italic">Loading...</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Answers */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-2">
          <div className="font-semibold text-gray-700 mb-2">Answers:</div>
          <ul className="space-y-2">
            {question.answers.map((a, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="font-medium text-gray-800">{a.answer}</span>
                <span className="font-medium text-blue-600">{a.answer_ar}</span>
                {a.isCorrect && (
                  <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs font-bold ml-2">
                    Correct
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* difficulty */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-2">
          <div className="font-semibold text-gray-700 mb-2">Difficulty:</div>
          <ul className="space-y-2">
            <li className="flex items-center gap-3">
              <span className="font-medium text-gray-800">{question.difficulty ? question.difficulty : 'N/A'}</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}


export default function QuestionForm({ onSubmit, initial, mode = 'add' }: QuestionFormProps) {
  // All questions (for options gathering)
  const [allQuestions, setAllQuestions] = useState<QuestionInput[]>([]);
  const [typeOptions, setTypeOptions] = useState<string[]>(['Multiple Choice', 'True or False']);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>(DEFAULT_STATUSES);
  const [difficultyOptions, setDifficultyOptions] = useState<string[]>(DEFAULT_DIFFICULTIES);

  // Inputs for live search
  const [tagInput, setTagInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [verseInput, setVerseInput] = useState('');
  const [newStatusInput, setNewStatusInput] = useState('');



  // Filtered options
  const filterOptions = (input: string, options: string[]) =>
    options.filter(opt => opt.toLowerCase().includes(input.trim().toLowerCase()));

  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Preview mode
  const [showPreview, setShowPreview] = useState(false);

  // The question being edited/created
  const [data, setData] = useState<QuestionInput>({
    id: initial?.id,
    question: initial?.question || '',
    question_ar: initial?.question_ar || '',
    type: initial?.type || 'Multiple Choice',
    categories: initial?.categories || [],
    tags: initial?.tags || [],
    status: initial?.status || 'draft',
    verses: initial?.verses || [],
    answers:
      initial?.answers ||
      [
        { id: 1, answer: '', answer_ar: '', isCorrect: false },
        { id: 2, answer: '', answer_ar: '', isCorrect: false },
        { id: 3, answer: '', answer_ar: '', isCorrect: false },
      ],
  });

  // Gather existing options on mount
  useEffect(() => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then((questions: QuestionInput[]) => {
        setAllQuestions(questions);

        const catSet = new Set<string>();
        const tagSet = new Set<string>();
        const typeSet = new Set<string>(typeOptions);
        const statusSet = new Set<string>(DEFAULT_STATUSES);

        questions.forEach((q) => {
          q.categories?.forEach((cat) => catSet.add(cat));
          q.tags?.forEach((tag) => tagSet.add(tag));
          if (q.type) typeSet.add(q.type);
          if (q.status) statusSet.add(q.status);
        });

        setCategoryOptions(Array.from(catSet));
        setTagOptions(Array.from(tagSet));
        setTypeOptions(Array.from(typeSet));
        setStatusOptions(Array.from(statusSet));
      });
    // eslint-disable-next-line
  }, []);

  // Filter on input for tags/categories
  useEffect(() => {
    setFilteredTags(
      tagInput ? filterOptions(tagInput, tagOptions) : tagOptions
    );
  }, [tagInput, tagOptions]);

  useEffect(() => {
    setFilteredCategories(
      categoryInput ? filterOptions(categoryInput, categoryOptions) : categoryOptions
    );
  }, [categoryInput, categoryOptions]);

  // Answers handling
  const handleAnswerChange = (index: number, key: keyof Answer, value: any) => {
    const updated = [...data.answers];
    updated[index] = { ...updated[index], [key]: value };
    setData({ ...data, answers: updated });
  };

  // Type change (handles T/F reset)
  const handleTypeChange = (type: string) => {
    if (type === 'True or False') {
      setData({
        ...data,
        type,
        answers: [
          { id: 1, answer: 'True', answer_ar: 'صحيح', isCorrect: data.answers[0]?.isCorrect || false },
          { id: 2, answer: 'False', answer_ar: 'خاطئ', isCorrect: data.answers[1]?.isCorrect || false },
        ],
      });
    } else {
      setData({
        ...data,
        type,
        answers: [
          { id: 1, answer: '', answer_ar: '', isCorrect: false },
          { id: 2, answer: '', answer_ar: '', isCorrect: false },
          { id: 3, answer: '', answer_ar: '', isCorrect: false },
        ],
      });
    }
  };

  // Add new option helper
  const addNewOption = (
    value: string,
    setOptions: (opts: string[]) => void,
    options: string[],
    selected: string[],
    setSelected: (vals: string[]) => void
  ) => {
    if (!value.trim() || options.includes(value)) return;
    setOptions([...options, value]);
    setSelected([...selected, value]);
  };

  // Add new status
  const handleAddStatus = () => {
    const value = newStatusInput.trim();
    if (!value || statusOptions.includes(value)) return;
    setStatusOptions([...statusOptions, value]);
    setData({ ...data, status: value });
    setNewStatusInput('');
  };

  // Inline validation, populates `errors` object
  const validate = (d: QuestionInput) => {
    const errs: Record<string, string> = {};
    if (!d.question.trim()) errs.question = 'English question is required';
    if (!d.question_ar.trim()) errs.question_ar = 'Arabic question is required';
    if (!d.type) errs.type = 'Type is required';
    if (d.categories.length === 0) errs.categories = 'Select at least one category';
    if (d.tags.length === 0) errs.tags = 'Select at least one tag';
    if (!d.status) errs.status = 'Status is required';
    // Answers validation
    if (d.type === 'True or False') {
      if (!d.answers.some((a) => a.isCorrect)) errs.answers = 'Select the correct answer';
    } else {
      if (!d.answers.some((a) => a.isCorrect)) errs.answers = 'Mark at least one answer as correct';
      if (d.answers.some((a) => !a.answer.trim() || !a.answer_ar.trim()))
        errs.answers = 'All answer fields are required';
    }
    return errs;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // console.log(data);
    onSubmit({ ...data, id: data.id ?? uuidv4() });
  };

  // Handle preview
  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setShowPreview(true);
  };

  const router = useRouter();
  const [updateMsg, setUpdateMsg] = useState('');

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSubmit({ ...data, id: data.id ?? uuidv4() });

    if (mode === 'add') {
      router.refresh();
    } else {
      setUpdateMsg('Question updated!');
      // Optionally: refetch question data here if needed
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 border border-gray-300 rounded shadow-md max-w-2xl mx-auto bt-8 "
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question (EN)</label>
          <textarea
            // type="text"
            value={data.question}
            onChange={(e) => setData({ ...data, question: e.target.value })}
            className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 w-full"
          />
          <FieldError error={errors.question} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question (AR)</label>
          <textarea
            // type="text"
            value={data.question_ar}
            onChange={(e) => setData({ ...data, question_ar: e.target.value })}
            className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 w-full"
            dir="rtl"
          />
          <FieldError error={errors.question_ar} />
        </div>


        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(categoryInput ? filteredCategories : categoryOptions).map((cat) => (
              <label
                key={cat}
                className={`flex items-center space-x-2 border rounded px-3 py-1 cursor-pointer ${data.categories.includes(cat)
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={data.categories.includes(cat)}
                  onChange={() =>
                    setData({
                      ...data,
                      categories: data.categories.includes(cat)
                        ? data.categories.filter((c) => c !== cat)
                        : [...data.categories, cat],
                    })
                  }
                  className="accent-purple-700"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type to search/add category"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && categoryInput.trim()) {
                e.preventDefault();
                const found = categoryOptions.find(
                  (c) => c.toLowerCase() === categoryInput.trim().toLowerCase()
                );
                if (found) {
                  if (!data.categories.includes(found)) {
                    setData({ ...data, categories: [...data.categories, found] });
                  }
                } else {
                  setCategoryOptions([...categoryOptions, categoryInput.trim()]);
                  setData({ ...data, categories: [...data.categories, categoryInput.trim()] });
                }
                setCategoryInput('');
              }
            }}
            className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 w-full"
          />
          <FieldError error={errors.categories} />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(tagInput ? filteredTags : tagOptions).map((tag) => (
              <label
                key={tag}
                className={`flex items-center space-x-2 border rounded px-3 py-1 cursor-pointer ${data.tags.includes(tag)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={data.tags.includes(tag)}
                  onChange={() =>
                    setData({
                      ...data,
                      tags: data.tags.includes(tag)
                        ? data.tags.filter((t) => t !== tag)
                        : [...data.tags, tag],
                    })
                  }
                  className="accent-green-700"
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type to search/add tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && tagInput.trim()) {
                e.preventDefault();
                const found = tagOptions.find(
                  (t) => t.toLowerCase() === tagInput.trim().toLowerCase()
                );
                if (found) {
                  if (!data.tags.includes(found)) {
                    setData({ ...data, tags: [...data.tags, found] });
                  }
                } else {
                  setTagOptions([...tagOptions, tagInput.trim()]);
                  setData({ ...data, tags: [...data.tags, tagInput.trim()] });
                }
                setTagInput('');
              }
            }}
            className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 w-full"
          />
          <FieldError error={errors.tags} />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex gap-2 mb-1">
            <select
              value={data.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Add new type"
              className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addNewOption(
                    e.currentTarget.value,
                    setTypeOptions,
                    typeOptions,
                    [data.type],
                    (vals) => handleTypeChange(vals[0])
                  );
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          <FieldError error={errors.type} />
        </div>

        {/* Answers */}
        {(data.type === 'Multiple Choice' || data.type === 'multiple choice') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Answers</label>
            {data.answers.map((a, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder={`Answer ${i + 1}`}
                  value={a.answer}
                  onChange={(e) => handleAnswerChange(i, 'answer', e.target.value)}
                  className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 w-full"
                />
                <input
                  type="text"
                  placeholder={`Answer AR ${i + 1}`}
                  value={a.answer_ar}
                  onChange={(e) => handleAnswerChange(i, 'answer_ar', e.target.value)}
                  className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 w-full"
                  dir='rtl'
                />
                <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={a.isCorrect}
                    onChange={(e) => handleAnswerChange(i, 'isCorrect', e.target.checked)}
                    className="accent-blue-700"
                  />
                  <span>Correct</span>
                </label>
              </div>
            ))}
            <FieldError error={errors.answers} />
          </div>
        )}

        {(data.type === 'True or False' || data.type === 'true or false') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Correct Answer</label>
            {[{ label: 'True', ar: 'صحيح' }, { label: 'False', ar: 'خاطئ' }].map((opt, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={opt.label}
                  disabled
                  className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 w-full"
                />
                <input
                  type="text"
                  value={opt.ar}
                  disabled
                  className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 w-full"
                />
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={data.answers[i]?.isCorrect || false}
                    onChange={(e) => handleAnswerChange(i, 'isCorrect', e.target.checked)}
                    className="accent-blue-700"
                  />
                  <span>Correct</span>
                </label>
              </div>
            ))}
            <FieldError error={errors.answers} />
          </div>
        )}

        {/* Verses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Verses (optional)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={verseInput}
              placeholder="Type to search/add verse"
              onChange={(e) => setVerseInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && verseInput.trim()) {
                  e.preventDefault();
                  // prevent duplicates
                  if (!data.verses.includes(verseInput.trim())) {
                    setData({ ...data, verses: [...data.verses, verseInput.trim()] });
                  }
                  setVerseInput('');
                }
              }}
              className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {data.verses
              .filter(v =>
                verseInput
                  ? v.toLowerCase().includes(verseInput.trim().toLowerCase())
                  : true
              )
              .map((verse) => (
                <span key={verse} className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs">
                  {verse}
                  <button
                    type="button"
                    className="ml-2 text-blue-600 hover:text-blue-900"
                    onClick={() =>
                      setData({ ...data, verses: data.verses.filter((v) => v !== verse) })
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <div className="flex gap-2 mb-1">
            <select
              value={data.status}
              onChange={(e) => setData({ ...data, status: e.target.value })}
              className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Add new status"
              className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
              value={newStatusInput}
              onChange={(e) => setNewStatusInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddStatus();
                }
              }}
            />
            <button
              type="button"
              className="bg-purple-500 hover:bg-purple-600 text-white rounded px-3 py-1 text-sm"
              onClick={handleAddStatus}
            >
              Add
            </button>
          </div>
          <FieldError error={errors.status} />
        </div>

        {/* difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <div className="flex gap-2 mb-1">
            <select
              // value={data.difficulty ? data.difficulty : 'medium'}
              onChange={(e) => setData({ ...data, difficulty: e.target.value })}
              className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
            >
              {difficultyOptions.map((difficulty) => (
                <option key={difficulty} value={difficulty} >
                  {difficulty}
                </option>
              ))}
            </select>
          </div>
          <FieldError error={errors.difficulty} />
        </div>

        {/* Form buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={handlePreview}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded shadow"
          >
            Preview
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
          >
            {
              mode === 'edit' ? "Update Question" : "Save Question"
            }
          </button>

          {mode === 'add' && (<button
            type="button"
            onClick={handleSaveAndContinue}
            className='bg-green-500 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow'>
            Save & Add Another
          </button>
          )
          }

          {mode === 'edit' && (
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                onClick={() => router.push(`/${data.id}`)}
              >
                Display
              </button>
              <button
                type="button"
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => router.push('/')}
              >
                Back to List
              </button>
            </div>
          )}


        </div>
      </form>
      {/* Preview Modal */}
      {showPreview && <PreviewModal question={data} onClose={() => setShowPreview(false)} />}
    </>
  );
}
