import { useEffect, useState } from "react";
import QuestionForm, { QuestionInput } from "@/components/QuestionForm"; 

export function QuickEditModal({
  questionId,
  open,
  onClose,
  onSaved, // optional callback after save
}: {
  questionId: string;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [initial, setInitial] = useState<QuestionInput | null>(null);

  useEffect(() => {
    if (open && questionId) {
      fetch(`/api/questions/${questionId}`)
        .then((res) => res.ok ? res.json() : null)
        .then(setInitial);
    }
  }, [open, questionId]);

  const handleUpdate = async (data: QuestionInput) => {
    await fetch(`/api/questions/${questionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (onSaved) onSaved();
    onClose();
  };

  if (!open || !initial) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center overflow-y-auto top-0  pt-70">
      <div className="bg-white p-6 rounded-xl max-w-2xl w-full shadow-2xl border border-gray-200 relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-blue-700 text-3xl font-bold rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close"
        >
          &times;
        </button>
        <QuestionForm
          initial={initial}
          onSubmit={handleUpdate}
          mode="edit"
        />
      </div>
    </div>
  );
}
