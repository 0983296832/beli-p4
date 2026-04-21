import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_REFRESH_TOKEN_KEY } from '@constants/index';

const getToken = () => {
  return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
};

const saveToken = (token: string) => {
  localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
};

const removeToken = () => {
  localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
};

const getRefreshToken = () => {
  return localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
};

const saveRefreshToken = (refreshToken: string) => {
  localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, refreshToken);
};

const removeRefreshToken = () => {
  localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
};

export { getToken, getRefreshToken, saveRefreshToken, removeRefreshToken, saveToken, removeToken };
