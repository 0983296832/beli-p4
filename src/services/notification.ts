import apiClient from '@lib/AxiosClient';

const notiServices = {
  getNotifications: (filter?: object) => {
    const url = '/notifications';
    return apiClient.get(url, { params: filter });
  },
  putReadNotification: (id: number) => {
    const url = `/notification/${id}/read`;
    return apiClient.put(url);
  },
  putReadAllNotifications: () => {
    const url = '/notifications/read_all';
    return apiClient.put(url);
  },
  getNotificationStatistic: () => {
    const url = '/notification_statistic';
    return apiClient.get(url);
  }
};

export default notiServices;
