import apiClient from '@lib/AxiosClient';

const teachingProgramServices = {
  getTeachingPrograms: (filter?: object) => {
    const url = '/teaching_programs';
    return apiClient.get(url, { params: filter });
  },
  getSharedTeachingPrograms: (filter?: object) => {
    const url = 's/teaching_programs';
    return apiClient.get(url, { params: filter });
  },
  getTeachingProgram: (id: number, filter?: object) => {
    const url = '/teaching_program/' + id;
    return apiClient.get(url, { params: filter });
  },
  postTeachingProgram: (body?: object) => {
    const url = '/teaching_program';
    return apiClient.post(url, body);
  },
  putTeachingProgram: (id: number, body?: object) => {
    const url = '/teaching_program/' + id;
    return apiClient.put(url, body);
  },
  deleteTeachingProgram: (id: number) => {
    const url = '/teaching_program/' + id;
    return apiClient.delete(url);
  },
  getTeachingProgramDetails: (filter?: object) => {
    const url = '/teaching_program_details';
    return apiClient.get(url, { params: filter });
  },
  getTeachingProgramDetail: (id: number, filter?: object) => {
    const url = '/teaching_program_detail/' + id;
    return apiClient.get(url, { params: filter });
  },
  postTeachingProgramDetail: (body?: object) => {
    const url = '/teaching_program_detail';
    return apiClient.post(url, body);
  },
  putTeachingProgramDetail: (id: number, body?: object) => {
    const url = '/teaching_program_detail/' + id;
    return apiClient.put(url, body);
  },
  deleteTeachingProgramDetail: (id: number) => {
    const url = '/teaching_program_detail/' + id;
    return apiClient.delete(url);
  },
  getTeachingProgramDetailImportForm: () => {
    const url = `/import/teaching_program_detail/form`;
    return apiClient.get(url, {
      responseType: 'blob'
    });
  },

  postTeachingProgramDetailImportForm: (body: any) => {
    const url = `/import/teaching_program_detail/validate`;
    return apiClient.post(url, body, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  postTeachingProgramDetailImport: (body: any) => {
    const url = `/import/teaching_program_detail/execute`;
    return apiClient.post(url, body);
  }
};

export default teachingProgramServices;
