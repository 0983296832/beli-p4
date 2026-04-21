import axios from 'axios';
import { getBaseUrl } from '@lib/HttpHelper';

const authServices = {
  login: async (body: any) => {
    try {
      const url = getBaseUrl() + '/login';
      const response = await axios.post(url, body);
      return response;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },
  register: (body: any) => {
    const url = getBaseUrl() + 'auth/register';
    return axios.post(url, body);
  },
  forgotPassword: async (body: any) => {
    try {
      const url = getBaseUrl() + '/request-create-otp';
      const response = await axios.post(url, body);
      return response;
    } catch (error) {
      console.error('Forgot Password Error:', error);
      throw error;
    }
  },
  verifyOtp: async (username: string, otp: string) => {
    try {
      const url = getBaseUrl() + '/validate-create-otp';
      const response = await axios.post(url, { username, otp });
      return response;
    } catch (error) {
      console.error('Verify OTP Error:', error);
      throw error;
    }
  },
  resetPassword: async (body: object) => {
    try {
      const url = getBaseUrl() + '/change-password-via-otp';
      const response = await axios.post(url, body);
      return response;
    } catch (error) {
      console.error('Reset Password Error:', error);
      throw error;
    }
  }
};

export default authServices;
