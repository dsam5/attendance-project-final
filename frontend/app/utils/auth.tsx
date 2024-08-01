//function to obtain different access tokens
export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) {
      throw new Error('No refresh token found');
    }

    const response = await fetch('http://127.0.0.1:8000/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('access', data.access);
    // localStorage.setItem('refresh', data.refresh);
    // display access and refresh tokens for testing
    // const refresh1 = localStorage.getItem('refresh');
    // console.log("access: "+ data.access);
    // console.log("refresh: "+ refresh1);
    console.log('Token refreshed successfully');
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
};