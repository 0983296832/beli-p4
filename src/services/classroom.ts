import apiClient from '@lib/AxiosClient';

const classroomServices = {
  getClassrooms: (filter?: object) => {
    const url = '/classrooms';
    return apiClient.get(url, { params: filter });
  },
  getSharedClassrooms: (filter?: object) => {
    const url = 's/classrooms';
    return apiClient.get(url, { params: filter });
  },
  getClassroom: (id: number, filter?: object) => {
    const url = '/classroom/' + id;
    return apiClient.get(url, { params: filter });
  },
  postClassroom: (body?: object) => {
    const url = '/classroom';
    return apiClient.post(url, body);
  },
  putClassroom: (id: number, body?: object) => {
    const url = '/classroom/' + id;
    return apiClient.put(url, body);
  },
  deleteClassroom: (id: number) => {
    const url = '/classroom/' + id;
    return apiClient.delete(url);
  },
  getClassroomImportForm: () => {
    const url = `/import/classrooms/form`;
    return apiClient.get(url, {
      responseType: 'blob'
    });
  },

  postClassroomImportForm: (body: any) => {
    const url = `/import/classrooms/validate`;
    return apiClient.post(url, body, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  postClassroomImport: (body: any) => {
    const url = `/import/classrooms/execute`;
    return apiClient.post(url, body);
  }
};

export default classroomServices;
