'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import backgroundImage from '../blue.jpg';

export default function VerifyCodePage() {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleVerifyCode = async() => {
    try {
      const email = localStorage.getItem('email')
      const reset_code = code
      const response = await fetch('http://127.0.0.1:8000/auth/verify-reset-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email , reset_code}),
      });
      const data = await response.json()
      if (response.status === 200) {
        localStorage.setItem('reset_code',code)
        router.push('/reset-password');
      }
      else{
        setError(data.error)
      }
    } catch (error) {
      setError('An error occured.Try again or use a new reset code')
    }
  };

  /*
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/request-password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email}),
      });
      const data = await response.json()
      console.log(data)
      if (response.status === 200) {
        setSuccess(true);
        localStorage.setItem('email',email)
        router.push('/verify-code');
      }
      else{
        setError(data.error)
      }
      
    } catch (err) {
      console.log(err)
      console.log(data)
      if (err.response && err.response.data) {
      setError(err.response.data.error || 'An error occurred');
    } else {
      setError('An error occurred');
    }
    } finally {
      setLoading(false);
    }
  */
  return (
    <div className="container">
      <div className="form-container">
        <h1>Verify Code</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="code">4-Digit Code</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="Enter the 4-digit code"
            aria-label="4-Digit Code"
          />
        </div>
        <button onClick={handleVerifyCode}>Verify Code</button>
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
        button:hover {
          background: #005bb5;
        }
      `}</style>
    </div>
  );
}