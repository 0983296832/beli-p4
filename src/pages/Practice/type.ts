export type AnswerType = {
  multi_choice: string[];
  fill_the_blank: string;
  matching: {
    top: string;
    bottom: string;
  }[];
  ordering: {
    top: (string | null)[];
    bottom: (string | null)[];
    matches?: string[];
  };
  reverse_word: { id: string; position: number }[];
};

export type StudentAnswerType = {
  question_id: number;
  flagged?: boolean;
  answer: AnswerType['fill_the_blank' | 'multi_choice' | 'matching' | 'ordering' | 'reverse_word'];
};

export interface ExamFilter {
  location_id: number;
  classroom_ids: number[];
  student_ids: number[];
}

export interface ExamSetting {
  id: number;
  exercise_id: number;
  exam_code: string;
  filters: ExamFilter[];
  created_by_type: number;
  creator: number;
  valid: number;
  start_time: number; // Unix timestamp
  end_time: number; // Unix timestamp
  mode: number;
  try_number: number;
  try_number_per_question: number;
  target_percentage: number;
  show_answer_during_exam: number;
  show_answer_after_exam: number;
  is_shuffle_questions: number;
  is_shuffle_answer: number;
  time_for_each_question: number;
  time_for_exam: number;
  ranking: number;
}
