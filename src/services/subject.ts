import apiClient from '@lib/AxiosClient';

const subjectServices = {
  getSubjects: (filter?: object) => {
    const url = '/subjects';
    return apiClient.get(url, { params: filter });
  },
  getSharedSubjects: (filter?: object) => {
    const url = 's/subjects';
    return apiClient.get(url, { params: filter });
  },
  getSubject: (id: number, filter?: object) => {
    const url = '/subject/' + id;
    return apiClient.get(url, { params: filter });
  },
  postSubject: (body?: object) => {
    const url = '/subject';
    return apiClient.post(url, body);
  },
  putSubject: (id: number, body?: object) => {
    const url = '/subject/' + id;
    return apiClient.put(url, body);
  },
  deleteSubject: (id: number) => {
    const url = '/subject/' + id;
    return apiClient.delete(url);
  }
};

export default subjectServices;
