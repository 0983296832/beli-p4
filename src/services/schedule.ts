import apiClient from '@lib/AxiosClient';

const scheduleServices = {
  getSchedules: (filter?: object) => {
    const url = '/timelines';
    return apiClient.get(url, { params: filter });
  },
 
  getSchedule: (id: number, filter?: object) => {
    const url = '/timeline/' + id;
    return apiClient.get(url, { params: filter });
  },
  putSchedule: (id: number, body?: object) => {
    const url = '/timeline/' + id;
    return apiClient.put(url, body);
  }
};

export default scheduleServices;
