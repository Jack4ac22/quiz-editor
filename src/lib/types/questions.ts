export type Answer = {
  id?: string;
  answer: string;
  ar_answer: string;
  isCorrect: boolean;
};

export type Question = {
  id?: string;
  category: 'multiple-choice' | 'true-or-false';
  tags: string[];
  question: string;
  ar_question: string;
  answers: Answer[];
  references: string[];
};

export type QuestionProps = {
  initial?: Question;
  onSubmit: (question: Question) => void;
};