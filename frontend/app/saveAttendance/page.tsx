'use client';
import { useRouter } from 'next/router';

export default function SaveAttendancePage() {
  const router = useRouter();
  const { course } = router.query;

  return (
    <div className="container">
      <h1>Attendance for {new Date().toLocaleDateString()} saved!</h1>
      <div className="actions">
        <button onClick={() => router.push('/dashboard')}>Return to Main Dashboard</button>
        <button onClick={() => router.push(`/inspectRecords?course=${course}`)}>Go to Records for {course}</button>
      </div>
      <style jsx>{`
        .container {
          padding: 2rem;
          text-align: center;
        }
        h1 {
          margin-bottom: 2rem;
        }
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        button {
          padding: 0.75rem 1.5rem;
          background: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: #005bb5;
        }
      `}</style>
    </div>
  );
}
