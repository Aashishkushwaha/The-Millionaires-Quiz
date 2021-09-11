export type QuestionType = {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

export type QuestionState = QuestionType & {
  options: string[];
  questionNo: number;
  questionPrize: string;
};

export type AnswerType = {
  question: string;
  answer: string;
  correct_answer: string;
  correct: boolean;
};

export type LifelineType = {
  "Audience Poll": boolean;
  "Revive Lifeline": boolean;
  "Double Dipp": boolean;
  "Expert Advice": boolean;
};
