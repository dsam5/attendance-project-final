// pages/inspectRecords/index.tsx

import { useRouter } from 'next/router';
import Link from 'next/link';

export default function InspectRecordsPage() {
  const router = useRouter();
  const { course } = router.query;

  return (
    <div className="container">
      <h1>Inspect Previous Records: {course}</h1>
      <div className="actions">
        <Link href={`/viewByCourse?course=${course}`}>
          <a>View By Course</a>
        </Link>
        <Link href={`/viewByWeek?course=${course}`}>
          <a>View By Week</a>
        </Link>
      </div>
      <style jsx>{`
        .container {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        h1 {
          margin-bottom: 2rem;
          text-align: center;
        }
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
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
