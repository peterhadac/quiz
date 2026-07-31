export interface Question {
  id: string;
  type: 'multiple_choice' | 'write_in';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;
  options?: string[];
  answer: string;
  notes?: string;
}

export interface QuestionJson {
  category: string;
  questions: Question[];
}

export interface QuestionWithMeta extends Question {
  category: string;
  file: string;
}
