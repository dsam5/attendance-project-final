'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { course } = params || {};

  return (
    <div className="container">
      <h1>Course Detail: {course}</h1>
      <div className="actions">
        <Link href={`/takeAttendance?course=${course}`} legacyBehavior>
          Take Attendance
        </Link>
        <Link href={`/inspectRecords?course=${course}`} legacyBehavior>
          Inspect Previous Records
        </Link>
      </div>
      <style jsx>{`
        .container {
          padding: 2rem;
        }
        h1 {
          margin-bottom: 2rem;
          text-align: center;
        }
        .actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }
        a {
          padding: 1rem 2rem;
          background: #0070f3;
          color: #fff;
          border-radius: 4px;
          text-decoration: none;
          cursor: pointer;
        }
        a:hover {
          background: #005bb5;
        }
      `}</style>
    </div>
  );
}


