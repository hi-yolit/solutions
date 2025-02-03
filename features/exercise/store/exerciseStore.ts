import { create } from "zustand";

interface QuestionWithTopic {
  id: string;
  exerciseNumber: string;
  questionNumber: string;
  topicId: string;
  topicTitle: string;
  topicNumber: number;
}

interface ExerciseStore {
  questions: Record<string, QuestionWithTopic[]>;
  setQuestions: (key: string, questions: QuestionWithTopic[]) => void;
}

export const useExerciseStore = create<ExerciseStore>((set) => ({
  questions: {},
  setQuestions: (key, questions) =>
    set((state) => ({
      questions: { ...state.questions, [key]: questions },
    })),
}));
