'use client';
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import backgroundImage from '../blue.jpg';

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        router.push('/dashboard');
      } else {
        setError(data.detail || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1>Login</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter your username"
            aria-label="Username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            aria-label="Password"
          />
        </div>
        <button onClick={handleLogin} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Login'}
        </button>
        <div className="forgot-password-link">
          <Link href="/forgotPassword">Forgot Password?</Link>
        </div>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
           min-height: 100vh;
          min-width: 100vw;
          background-image: url(${backgroundImage.src});
          background-size: cover;
          background-position: center;
          font-family: 'Roboto', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .form-container {
          max-width: 400px;
          width: 100%;
          padding: 2rem;
          background: #fff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        h1 {
          margin-bottom: 2rem;
          font-size: 2rem;
          text-align: center;
        }
        .error-message {
          color: red;
          margin-bottom: 1rem;
          text-align: center;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
        }
        input {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          background: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        button:hover:enabled {
          background: #005bb5;
        }
        .forgot-password-link {
          margin-top: 1rem;
          text-align: center;
        }
        .forgot-password-link a {
          color: #0070f3;
          text-decoration: none;
          font-size: 0.9rem;
        }
        .forgot-password-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}