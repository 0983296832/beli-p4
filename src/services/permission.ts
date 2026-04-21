import apiClient from '@lib/AxiosClient';

const permissionServices = {
  getPermissions: (filter?: object) => {
    const url = '/permissions';
    return apiClient.get(url, { params: filter });
  },
  getCurrentUserPermissions: (filter?: object) => {
    const url = 'me/permissions';
    return apiClient.get(url, { params: filter });
  },
  getGroupPermissions: (filter?: object) => {
    const url = '/roles';
    return apiClient.get(url, { params: filter });
  },
  getPermissionDetail: (id: number, filter?: object) => {
    const url = '/role/' + id;
    return apiClient.get(url, { params: filter });
  },
  postPermission: (body?: object) => {
    const url = '/role';
    return apiClient.post(url, body);
  },
  putPermission: (id: number, body?: object) => {
    const url = '/role/' + id;
    return apiClient.put(url, body);
  },
  deletePermission: (id: number, body?: object) => {
    const url = '/role/' + id;
    return apiClient.delete(url, { data: body });
  }
};

export default permissionServices;
