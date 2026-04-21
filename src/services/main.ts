import apiClient from '@lib/AxiosClient';
import axios from 'axios';

const mainServices = {
  getCurrentUser: (filter?: object) => {
    const url = '/current_user';
    return apiClient.get(url, { params: filter });
  },
  getUsers: (filter?: object) => {
    const url = '/s/users';
    return apiClient.get(url, { params: filter });
  },
  getUserPermission: (filter?: object) => {
    const url = '/me/permissions';
    return apiClient.get(url, { params: filter });
  },
  onUploadFile: (body: any) => {
    const url = 'img_upload';
    return apiClient.post(url, body, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  onTempUploadFile: (body: any) => {
    const url = 'https://s3.beliteachers.com/upload';
    return axios.post(url, body, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getProvinces: () => {
    const url = 's/provinces';
    return apiClient.get(url);
  },
  getDistricts: (filter: object) => {
    const url = 's/districts';
    return apiClient.get(url, { params: filter });
  },
  getWards: (filter: object) => {
    const url = 's/wards';
    return apiClient.get(url, { params: filter });
  }
};

export default mainServices;
