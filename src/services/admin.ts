import apiClient from '@lib/AxiosClient';

const adminServices = {
  getAdmins: (filter?: object) => {
    const url = '/admins';
    return apiClient.get(url, { params: filter });
  },
  getSharedAdmins: (filter?: object) => {
    const url = 's/admins';
    return apiClient.get(url, { params: filter });
  },
  getAdmin: (id: number, filter?: object) => {
    const url = '/admin/' + id;
    return apiClient.get(url, { params: filter });
  },
  postAdmin: (body?: object) => {
    const url = '/admin';
    return apiClient.post(url, body);
  },
  putAdmin: (id: number, body?: object) => {
    const url = '/admin/' + id;
    return apiClient.put(url, body);
  },
  deleteAdmin: (id: number) => {
    const url = '/admin/' + id;
    return apiClient.delete(url);
  }
};

export default adminServices;
