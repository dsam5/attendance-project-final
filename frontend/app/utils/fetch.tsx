import { useRouter } from 'next/navigation';

export async function fetchWithToken(url: string, options: RequestInit = {}) {
  const router = useRouter()
  const token = localStorage.getItem('access'); // Retrieve the access token from local storage

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) { // Unauthorized, token might be expired
    // Attempt to refresh the token
    console.log('we entered 401 but am on line 43');
    const refreshToken = localStorage.getItem('refresh');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch('http://127.0.0.1:8000/auth/token/refresh/', {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('accessToken', data.access);
          //localStorage.setItem('refreshToken', data.refresh);
          
          // Retry the original request
          return fetchWithToken(url, options);
        }
      } catch (error) {
        console.error('Failed to refresh token', error);
        alert("Session expired, please login")
        router.push('/login')
      }
    }
  }

  // If the response is not 401 or if the token refresh failed, return the original response
  return response;
}
