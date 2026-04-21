import apiClient from '@lib/AxiosClient';

const teachingLocationServices = {
  getTeachingLocations: (filter?: object) => {
    const url = '/locations';
    return apiClient.get(url, { params: filter });
  },
  getSharedTeachingLocations: (filter?: object) => {
    const url = 's/locations';
    return apiClient.get(url, { params: filter });
  },
  getTeachingLocation: (id: number, filter?: object) => {
    const url = '/location/' + id;
    return apiClient.get(url, { params: filter });
  },
  postTeachingLocation: (body?: object) => {
    const url = '/location';
    return apiClient.post(url, body);
  },
  putTeachingLocation: (id: number, body?: object) => {
    const url = '/location/' + id;
    return apiClient.put(url, body);
  },
  deleteTeachingLocation: (id: number) => {
    const url = '/location/' + id;
    return apiClient.delete(url);
  }
};

export default teachingLocationServices;
