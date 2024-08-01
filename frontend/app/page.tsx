'use client';

import Link from 'next/link';
import { Button, Grid } from '@mui/material';
import Image from 'next/image';
import plainWhiteImage from './blue.jpg';
import knustImage from './knust.jpg'; // Import the KNUST image
import image from './women.png'; // Import the other image

export default function Home() {
  return (
    <div className="container" style={{ backgroundImage: `url(${plainWhiteImage.src})` }}>
      <main className="main-content">
        <div className="rectangle">
          <div className="left-side">
            <Image
              src={image}
              alt="Face Image"
              width={800} // Set the desired width
              height={800} // Set the desired height
              className="image" // Add a class for styling
            />
          </div>
          <div className="right-side">
            <Image
              src={knustImage}
              alt="KNUST Logo"
              width={100} // Set the desired width
              height={150} // Set the desired height
              className="knust-image" // Add a class for styling
            />
            <h2 className="animated-title">Welcome to KNUST Attendance System</h2>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  href="/login"
                  className="animated-button"
                >
                  Login
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  href="/signup"
                  className="animated-button"
                >
                  Signup
                </Button>
              </Grid>
            </Grid>
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>&copy; 2024 Attendance System. All rights reserved.</p>
      </footer>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-width: 100vw;
          background-size: cover;
          background-position: center;
          font-family: Arial, sans-serif;
        }

        .main-content {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
          animation: fadeIn 1.5s ease-in-out;
        }

        .rectangle {
          display: flex;
          width: 80vw; 
          height: 40vw; 
          background-color: white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
          animation: slideIn 1s ease-in-out;
        }

        .image {
          position: absolute;
          top: 10%; 
          left: 10%; 
          width: 80px; 
          height: 100px; 
        }

        .left-side {
          flex: 1;
          background-color: lightblue;
          position: relative; 
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeIn 2s ease-in-out;
        }

        .knust-image {
          position: absolute;
          top: 10%; 
          left: 10%; 
          width: 80px; 
          height: 100px;
          animation: fadeIn 1.5s ease-in-out;
        }

        .right-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .right-side h1 {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #333;
        }

        .animated-title {
          animation: slideInFromRight 1.5s ease-in-out;
        }

        .animated-button {
          transition: transform 0.3s;
        }

        .animated-button:hover {
          transform: scale(1.1);
        }

        .footer {
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          text-align: center;
          padding: 1rem;
          animation: fadeIn 2s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .rectangle {
            width: 80vw; 
            height: 80vw;
            flex-direction: column;
          }

          .right-side h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
}