import apiClient from '@lib/AxiosClient';

const exerciseServices = {
  getExercises: (filter?: object) => {
    const url = '/exercises';
    return apiClient.get(url, { params: filter });
  },
  getSharedExercises: (filter?: object) => {
    const url = 's/exercises';
    return apiClient.get(url, { params: filter });
  },
  getExercise: (id: number, filter?: object) => {
    const url = '/exercise/' + id;
    return apiClient.get(url, { params: filter });
  },
  postExercise: (body?: object) => {
    const url = '/exercise';
    return apiClient.post(url, body);
  },
  postCopyExercise: (id: number, body?: object) => {
    const url = `/exercise/${id}/copy`;
    return apiClient.post(url, body);
  },
  putExercise: (id: number, body?: object) => {
    const url = '/exercise/' + id;
    return apiClient.put(url, body);
  },
  deleteExercise: (id: number) => {
    const url = '/exercise/' + id;
    return apiClient.delete(url);
  },
  getStudentExercise: (filter?: object) => {
    const url = '/exams';
    return apiClient.get(url, { params: filter });
  },
  deleteStudentExercise: (id?: number) => {
    const url = '/exam/' + id;
    return apiClient.delete(url);
  },
  getDetailStudentExercise: (id: number, filter?: object) => {
    const url = '/exam/' + id;
    return apiClient.get(url, { params: filter });
  },
  postAssignExercise: (exercise_id: number, body: object) => {
    const url = '/exam/' + exercise_id;
    return apiClient.post(url, body);
  },
  putAssignExercise: (assign_id: number, body: object) => {
    const url = '/exam/' + assign_id;
    return apiClient.put(url, body);
  },
  postSubmitExam: (exercise_id: number, body: object) => {
    const url = `exam/${exercise_id}/submit`;
    return apiClient.post(url, body);
  },
  postCheckQuestion: (question_id: number, body: object) => {
    const url = `question/${question_id}/check`;
    return apiClient.post(url, body);
  },
  postExamAccess: (exam_id: number) => {
    const url = `exam/${exam_id}/access`;
    return apiClient.post(url);
  },
  getExamAccess: (filters?: object) => {
    const url = `exam_access`;
    return apiClient.get(url, { params: filters });
  },
  postExamRate: (body: object) => {
    const url = `exam_rate`;
    return apiClient.post(url, body);
  },
  getExamRate: (filters?: object) => {
    const url = `exam_rates`;
    return apiClient.get(url, { params: filters });
  },
  getSubmitStat: (submit_id: number) => {
    const url = `student_submission/${submit_id}/submission_statistic`;
    return apiClient.get(url);
  },
  getExamSubmit: (filters: object) => {
    const url = `student_submissions`;
    return apiClient.get(url, { params: filters });
  },
  getExercisePrint: (exercise_id: number, filter?: object) => {
    const url = `/exercise/${exercise_id}/print`;
    return apiClient.get(url, {
      params: filter
      // responseType: 'blob'
    });
  }
};

export default exerciseServices;
