import apiClient from '@lib/AxiosClient';

const profileServices = {
  getProfile: (filter?: object) => {
    const url = '/me/user';
    return apiClient.get(url, { params: filter });
  },
  putProfile: (body?: object) => {
    const url = '/me/user';
    return apiClient.put(url, body);
  },
  putVerifyAccount: (body?: object) => {
    const url = '/me/user/verify';
    return apiClient.put(url, body);
  }
};

export default profileServices;
