import apiClient from '@lib/AxiosClient';

const teacherAssistantServices = {
  getTeacherAssistants: (filter?: object) => {
    const url = '/tas';
    return apiClient.get(url, { params: filter });
  },
  getSharedTeacherAssistants: (filter?: object) => {
    const url = 's/tas';
    return apiClient.get(url, { params: filter });
  },
  getTeacherAssistant: (id: number, filter?: object) => {
    const url = '/ta/' + id;
    return apiClient.get(url, { params: filter });
  },
  postTeacherAssistant: (body?: object) => {
    const url = '/ta';
    return apiClient.post(url, body);
  },
  putTeacherAssistant: (id: number, body?: object) => {
    const url = '/ta/' + id;
    return apiClient.put(url, body);
  },
  deleteTeacherAssistant: (id: number) => {
    const url = '/ta/' + id;
    return apiClient.delete(url);
  },
  getTeacherAssistantExport: (filter?: object) => {
    const url = `/export/tas`;
    return apiClient.get(url, {
      params: filter,
      responseType: 'blob'
    });
  }
};

export default teacherAssistantServices;
