'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter hook
import Webcam from 'react-webcam';
import { saveAs } from 'file-saver';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function TakeAttendance() {
    const router = useRouter(); // Initialize useRouter hook
    const searchParams = useSearchParams(); // Initialize useSearchParams hook
    const course_id = searchParams.get('course_id');

    const [attendanceList, setAttendanceList] = useState<{
        date: string;
        student_exam_number: number;
        student_name: string;
        course_id: string;
        time: string;
    }[]>([]);
    const webcamRef = useRef<Webcam>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Turn off the camera when leaving the page
    useEffect(() => {
      return () => {
        if (webcamRef.current?.video?.srcObject) {
          webcamRef.current.video.srcObject.getTracks().forEach(track => track.stop());
        }
      };
    }, []);

    const handleCapture = useCallback(async () => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        // Convert base64 image to a Blob
        const byteString = atob(imageSrc.split(',')[1]);
        const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        // Save the Blob as an image file (Optional)
        saveAs(blob, 'attendance_image.jpg');

        // Create a FormData object to send the image and course ID
        const formData = new FormData();
        formData.append('image', blob, 'attendance_image.jpg');
        formData.append('course_id', course_id); // Use course_id from URL

        setIsLoading(true);

        try {
          const token = localStorage.getItem('access');

          if (!token) {
            throw new Error('No access token found');
          }

          // Send POST request
          const response = await fetch('http://127.0.0.1:8000/attendance/take-auto-1/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          console.log('Success:', data);
          setAttendanceList(prevList => [
            ...prevList,
            {
              date: data.date,
              student_exam_number: data.student_exam_number,
              student_name: data.student_name,
              course_id: data.course_id,
              time: data.time,
            }
          ]);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }, [webcamRef, course_id]);

    const handleReset = () => {
      setAttendanceList([]);
    };

    return (
      <div className="container">
        <div className="content">
          <div className="webcam-container">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
            <button onClick={handleCapture} disabled={isLoading}>Take Attendance</button>
          </div>
          <div className="details-container">
            <h2>Attendance Details</h2>
            <p>{course_id}</p>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Exam Number</th>
                  <th>Student Name</th>
                  <th>Course ID</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.date}</td>
                    <td>{entry.student_exam_number}</td>
                    <td>{entry.student_name}</td>
                    <td>{entry.course_id}</td>
                    <td>{entry.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="button-group">
              <div className="view-week-button">
                <Link href={`/viewByWeek?course_id=${course_id}`}>
                  View By Week
                </Link>
              </div>
              <div className="reset-button">
                <button onClick={handleReset} disabled={isLoading}>Reset Attendance</button>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f0f0f0;
          }
          .content {
            display: flex;
            justify-content: space-around;
            align-items: flex-start;
            width: 100%;
            max-width: 1200px;
          }
          .webcam-container {
            flex: 1;
            text-align: center;
          }
          .details-container {
            flex: 1;
            padding: 2rem;
            background: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            margin-left: 2rem; 
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
          }
          th, td {
            padding: 0.5rem;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f0f0f0;
          }
          .button-group {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
          }
          .view-week-button a {
            display: inline-block;
            padding: 0.5rem 1rem;
            background-color: #0070f3;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .view-week-button a:hover {
            background-color: #005bb5;
          }
          .reset-button button {
            padding: 0.5rem 1rem;
            background-color: #dc3545;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .reset-button button:hover {
            background-color: #c82333;
          }
        `}</style>
      </div>
    );
}
