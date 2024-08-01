'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import backgroundImage from '../blue.jpg';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const validatePassword = (password: string): boolean => {
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasDigit = /\d/.test(password);
    return password.length >= 8 && hasSymbol && hasDigit;
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
    } else if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and contain at least one symbol and one digit');
    } else {
      try {
        setError(null);
        setSuccess('Password successfully reset! Redirecting to login page...');
        const email = localStorage.getItem('email');
        const reset_code = localStorage.getItem('reset_code');
        const response = await fetch('http://127.0.0.1:8000/auth/reset-password/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email,reset_code,new_password:password, new_password2 : confirmPassword}),
        });
        const data = await response.json()
        if (response.status === 200) {
          localStorage.removeItem('email');
          localStorage.removeItem('reset_code');
          setSuccess(data.message || 'success!');
          router.push('/login');
        }
        else{
          setError(data.error || 'An error occured. Try again')  
        }
      } catch (error) {
        setError('An error occured. Try again')
      }
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1>Reset Password</h1>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your new password"
            aria-label="New Password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirm your new password"
            aria-label="Confirm Password"
          />
        </div>
        <button onClick={handleResetPassword}>Reset Password</button>
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
        .success-message {
          color: green;
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
        button:hover {
          background: #005bb5;
        }
      `}</style>
    </div>
  );
}