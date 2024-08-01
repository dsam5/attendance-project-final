'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Link from 'next/link';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ViewByCoursePage() {
  const searchParams = useSearchParams();
  const course = searchParams.get('course');

  const [attendanceData, setAttendanceData] = useState([]);
  const [notQualified, setNotQualified] = useState([]);

  useEffect(() => {
    // Fetch attendance data (replace with actual data fetching logic)
    const fetchAttendanceData = async () => {
      try {
        // Example API call or data source
        const response = await fetch(`/api/attendance?course=${course}`);
        if (response.ok) {
          const data = await response.json();
          setAttendanceData(data);
          const notQualifiedStudents = data.filter(student => student.missedClasses >= 3);
          setNotQualified(notQualifiedStudents);
        } else {
          throw new Error('Failed to fetch attendance data');
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();
  }, [course]);

  const chartData = {
    labels: attendanceData.map(entry => entry.week), // Assuming week is a property in the attendance data
    datasets: [
      {
        label: 'Number of Students Attended',
        data: attendanceData.map(entry => entry.attendanceCount), // Assuming attendanceCount is a property in the attendance data
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container">
      <h1>Attendance Trends: {course}</h1>
      <div className="chart">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="not-qualified">
        <h2>Not Qualified to Write Exams</h2>
        <ul>
          {notQualified.map((student, index) => (
            <li key={index}>
              {student.name} ({student.indexNumber}) - Missed Classes: {student.missedClasses}
            </li>
          ))}
        </ul>
      </div>
      <div className="dashboard-link">
        <Link href="/dashboard">
          Go to Dashboard
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
        .chart {
          height: 400px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #ddd;
          margin-bottom: 2rem;
        }
        .not-qualified {
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          padding: 0.5rem 0;
        }
        .dashboard-link {
          text-align: center;
          margin-top: 2rem;
        }
        .dashboard-link a {
          display: inline-block;
          padding: 0.5rem 1rem;
          background-color: #0070f3;
          color: #fff;
          text-decoration: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .dashboard-link a:hover {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  );
}