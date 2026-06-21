import { create } from 'zustand';

export interface QuestionOption {
  key: string;
  text: string;
}

export interface TestQuestion {
  text: string;
  options: QuestionOption[];
  correct: string;
  explanation: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  marks?: number;
  negativeMarks?: number;
  prevYearRef?: string;
  imageUrl?: string;
}

export interface TestConfig {
  numQuestions: number;
  timePerQuestion: number | 'no_limit';
  difficultyFilter: string;
  subjectFilter: string;
  negativeMarking: boolean;
  totalTime: number; // in seconds
}

interface TestState {
  sessionId: string | null;
  bankId: string | null;
  bankName: string | null;
  questions: TestQuestion[];
  currentIndex: number;
  answers: Record<number, string>; // { qIndex: 'A' | 'B' | 'C' | 'D' }
  markedForReview: number[]; // we use array for easier JSON state saving
  visitedQuestions: number[];
  timeRemaining: number; // in seconds
  startTime: string | null;
  isSubmitted: boolean;
  timeTakenPerQuestion: Record<number, number>; // { qIndex: seconds }
  config: TestConfig | null;

  initTest: (
    sessionId: string,
    bankId: string,
    bankName: string,
    questions: TestQuestion[],
    timeRemaining: number,
    config: TestConfig
  ) => void;

  setAnswer: (index: number, key: string) => void;
  toggleMark: (index: number) => void;
  clearAnswer: (index: number) => void;
  goToQuestion: (index: number) => void;
  tickTime: () => void;
  incrementTimeSpent: (index: number) => void;
  submitTest: () => void;
  resetTest: () => void;
  loadSavedState: (saved: Partial<TestState>) => void;
}

export const useTestStore = create<TestState>((set) => ({
  sessionId: null,
  bankId: null,
  bankName: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  markedForReview: [],
  visitedQuestions: [0], // First question is visited by default
  timeRemaining: 0,
  startTime: null,
  isSubmitted: false,
  timeTakenPerQuestion: {},
  config: null,

  initTest: (sessionId, bankId, bankName, questions, timeRemaining, config) =>
    set({
      sessionId,
      bankId,
      bankName,
      questions,
      currentIndex: 0,
      answers: {},
      markedForReview: [],
      visitedQuestions: [0],
      timeRemaining,
      startTime: new Date().toISOString(),
      isSubmitted: false,
      timeTakenPerQuestion: {},
      config,
    }),

  setAnswer: (index, key) =>
    set((state) => ({
      answers: { ...state.answers, [index]: key },
    })),

  toggleMark: (index) =>
    set((state) => {
      const marked = state.markedForReview.includes(index)
        ? state.markedForReview.filter((i) => i !== index)
        : [...state.markedForReview, index];
      return { markedForReview: marked };
    }),

  clearAnswer: (index) =>
    set((state) => {
      const answers = { ...state.answers };
      delete answers[index];
      return { answers };
    }),

  goToQuestion: (index) =>
    set((state) => {
      const visited = state.visitedQuestions.includes(index)
        ? state.visitedQuestions
        : [...state.visitedQuestions, index];
      return { currentIndex: index, visitedQuestions: visited };
    }),

  tickTime: () =>
    set((state) => {
      if (state.timeRemaining <= 0) return { timeRemaining: 0 };
      return { timeRemaining: state.timeRemaining - 1 };
    }),

  incrementTimeSpent: (index) =>
    set((state) => {
      const currentSpent = state.timeTakenPerQuestion[index] || 0;
      return {
        timeTakenPerQuestion: {
          ...state.timeTakenPerQuestion,
          [index]: currentSpent + 1,
        },
      };
    }),

  submitTest: () =>
    set({
      isSubmitted: true,
    }),

  resetTest: () =>
    set({
      sessionId: null,
      bankId: null,
      bankName: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      markedForReview: [],
      visitedQuestions: [0],
      timeRemaining: 0,
      startTime: null,
      isSubmitted: false,
      timeTakenPerQuestion: {},
      config: null,
    }),

  loadSavedState: (saved) =>
    set((state) => ({
      ...state,
      ...saved,
    })),
}));
