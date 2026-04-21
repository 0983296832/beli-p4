import apiClient from '@lib/AxiosClient';

const teacherServices = {
  getTeachers: (filter?: object) => {
    const url = '/teachers';
    return apiClient.get(url, { params: filter });
  },
  getSharedTeachers: (filter?: object) => {
    const url = 's/teachers';
    return apiClient.get(url, { params: filter });
  },
  getTeacher: (id: number, filter?: object) => {
    const url = '/teacher/' + id;
    return apiClient.get(url, { params: filter });
  },
  postTeacher: (body?: object) => {
    const url = '/teacher';
    return apiClient.post(url, body);
  },
  putTeacher: (id: number, body?: object) => {
    const url = '/teacher/' + id;
    return apiClient.put(url, body);
  },
  deleteTeacher: (id: number) => {
    const url = '/teacher/' + id;
    return apiClient.delete(url);
  },
  getTeacherExport: (filter?: object) => {
    const url = `/export/teachers`;
    return apiClient.get(url, {
      params: filter,
      responseType: 'blob'
    });
  }
};

export default teacherServices;
