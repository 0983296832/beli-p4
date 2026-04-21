import apiClient from '@lib/AxiosClient';

const studentServices = {
  getStudents: (filter?: object) => {
    const url = '/students';
    return apiClient.get(url, { params: filter });
  },
  getSharedStudents: (filter?: object) => {
    const url = 's/students';
    return apiClient.get(url, { params: filter });
  },
  getStudent: (id: number, filter?: object) => {
    const url = '/student/' + id;
    return apiClient.get(url, { params: filter });
  },
  postStudent: (body?: object) => {
    const url = '/student';
    return apiClient.post(url, body);
  },
  putStudent: (id: number, body?: object) => {
    const url = '/student/' + id;
    return apiClient.put(url, body);
  },
  deleteStudent: (id: number) => {
    const url = '/student/' + id;
    return apiClient.delete(url);
  },
  getStudentImportForm: () => {
    const url = `/import/student/form`;
    return apiClient.get(url, {
      responseType: 'blob'
    });
  },
  getStudentExport: (filter?: object) => {
    const url = `/export/students`;
    return apiClient.get(url, {
      params: filter,
      responseType: 'blob'
    });
  },

  postStudentImportForm: (body: any) => {
    const url = `/import/student/validate`;
    return apiClient.post(url, body, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  postStudentImport: (body: any) => {
    const url = `/import/student/execute`;
    return apiClient.post(url, body);
  }
};

export default studentServices;
