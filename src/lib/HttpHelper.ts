const getBaseUrl = () => {
  const currentURL = window.location.origin; // Lấy URL hiện tại
  return 'https://vhs-education.com';

  if (currentURL.includes('localhost') || currentURL.includes('fe.') || currentURL?.includes('192.168.113.105')) {
    // return 'https://local.beliteachers.com';
    // return 'https://local-vhs.beliteachers.com';
    // return 'https://vhs-dev2.beliteachers.com';
    // return 'https://<your_url>.com';
  } else {
    return currentURL;
  }
};

export { getBaseUrl };
