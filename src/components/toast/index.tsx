import React from 'react';
import { toast } from 'react-toastify';

export const Toast = (
  type: 'info' | 'success' | 'warning' | 'error' | 'default',
  message: string,
  position: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left' = 'top-center'
) => {
  if (type == 'default') {
    return toast(`${message}`, {
      position: position,
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: 'light'
    });
  } else {
    return toast[type](`${message}`, {
      position: position,
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: 'light'
    });
  }
};
