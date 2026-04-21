import apiClient from '@lib/AxiosClient';

const reportExamServices = {
  getExerciseReport: (filter?: object) => {
    const url = 'report/exercises';
    return apiClient.get(url, { params: filter });
  },
  getExamSessionsReport: (exercise_id: number, filter?: object) => {
    const url = `report/exercises/${exercise_id}/exams`;
    return apiClient.get(url, { params: filter });
  },
  getExamSession: (exam_id: number, filter?: object) => {
    const url = 'report/exam/' + exam_id;
    return apiClient.get(url, { params: filter });
  },
  getExamSubmission: (filter: object) => {
    const url = '/report/student_submission';
    return apiClient.get(url, { params: filter });
  },
  putExamAssignResult: (exam_id: number) => {
    const url = `/report/exam/${exam_id}/publish`;
    return apiClient.put(url);
  },
  putExamFinish: (exam_id: number) => {
    const url = `/report/exam/${exam_id}/stop`;
    return apiClient.put(url);
  },
  putExamStudentNote: (submission_id: number, body: object) => {
    const url = `/student_submission/${submission_id}/note`;
    return apiClient.put(url, body);
  },
  getExamExport: (exam_id: number, filter?: object) => {
    const url = `/report/exercises/${exam_id}/exams/export`;
    return apiClient.get(url, {
      params: filter,
      responseType: 'blob'
    });
  },
  getExamSummariesExport: (exam_id: number) => {
    const url = `/report/exam/${exam_id}/export`;
    return apiClient.get(url, {
      responseType: 'blob'
    });
  },
  getStatSubmitFromStudent: (filter?: object) => {
    const url = `/report/student_submissions/export`;
    return apiClient.get(url, {
      params: filter,
      responseType: 'blob'
    });
  }
};

export default reportExamServices;
