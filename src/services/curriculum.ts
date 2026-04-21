import apiClient from '@lib/AxiosClient';

const curriculumServices = {
  getCurriculums: (filter?: object) => {
    const url = '/learning_programs';
    return apiClient.get(url, { params: filter });
  },
  getSharedCurriculums: (filter?: object) => {
    const url = 's/learning_programs';
    return apiClient.get(url, { params: filter });
  },
  getCurriculum: (id: number, filter?: object) => {
    const url = '/learning_program/' + id;
    return apiClient.get(url, { params: filter });
  },
  postCurriculum: (body?: object) => {
    const url = '/learning_program';
    return apiClient.post(url, body);
  },
  putCurriculum: (id: number, body?: object) => {
    const url = '/learning_program/' + id;
    return apiClient.put(url, body);
  },
  deleteCurriculum: (id: number) => {
    const url = '/learning_program/' + id;
    return apiClient.delete(url);
  }
};

export default curriculumServices;
