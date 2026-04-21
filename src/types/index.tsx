export interface FileData {
  url?: string;
  type?: string | null;
}

export interface MultipleChoiceOption {
  id?: string;
  is_correct_answer?: 0 | 1;
  answer_title?: string;
  file?: FileData;
}

export interface MultipleChoiceAnswers {
  is_multiple_choice?: 0 | 1;
  options?: MultipleChoiceOption[];
}

export interface FillInTheBlank {
  id?: number;
  answer_title?: string;
  input_type?: number;
  other_correct_answer?: string;
  ignore_case?: 0 | 1;
}

export interface MatchingOption {
  id?: number;
  answer_title?: string;
  file?: FileData;
}

export interface MatchingDescription {
  id?: number;
  answer_id?: number;
  answer_description?: string;
}

export interface Matching {
  options?: MatchingOption[];
  descriptions?: MatchingDescription[];
}

export interface Sort {
  options?: MatchingOption[];
  descriptions?: MatchingDescription[];
}

export interface ReverseWordOption {
  id?: number;
  answer_title?: string;
  position?: number;
}

export interface ReverseWord {
  options?: ReverseWordOption[];
}

export interface AnswerExplanation {
  explain_description?: string;
  explain_file?: FileData;
}

export interface FormData {
  question_type?: number;
  question_title?: string;
  question_file?: FileData;
  score?: number;
  multiple_choice_answers?: MultipleChoiceAnswers;
  fill_in_the_blank?: FillInTheBlank;
  matching?: Matching;
  sort?: Sort;
  reverse_word?: ReverseWord;
  answer_explanation?: AnswerExplanation;
}
