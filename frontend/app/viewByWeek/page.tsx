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

export default function ViewByWeek() {
  const searchParams = useSearchParams();
  const course_id = searchParams.get('course_id');

  const [attendanceData, setAttendanceData] = useState([]);
  const [notQualified, setNotQualified] = useState([]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await fetch(`http://127.0.0.1:8000/attendance/list-course-attendance/${course_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          processAttendanceData(data);
        } else {
          throw new Error('Failed to fetch attendance data');
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();
  }, [course_id]);

  const processAttendanceData = (data) => {
    const dates = [];
    const totalStudents = [];
    const attendedStudents = [];
    const notAttendedStudents = [];
    const notQualifiedStudents = new Map();

    for (const [date, details] of Object.entries(data)) {
      dates.push(date);
      totalStudents.push(details.summary.total_students);
      attendedStudents.push(details.summary.attended);
      notAttendedStudents.push(details.summary.not_attended);

      details.records.forEach((record) => {
        if (!record.attended) {
          if (notQualifiedStudents.has(record.student_exam_number)) {
            notQualifiedStudents.get(record.student_exam_number).missedClasses += 1;
          } else {
            notQualifiedStudents.set(record.student_exam_number, {
              name: record.student_name,
              indexNumber: record.student_exam_number,
              missedClasses: 1,
            });
          }
        }
      });
    }

    setAttendanceData({ dates, totalStudents, attendedStudents, notAttendedStudents });
    setNotQualified(Array.from(notQualifiedStudents.values()).filter(student => student.missedClasses >= 3));
  };

  const chartData = {
    labels: attendanceData.dates,
    datasets: [
      {
        label: 'Total Students',
        data: attendanceData.totalStudents,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Attended',
        data: attendanceData.attendedStudents,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Not Attended',
        data: attendanceData.notAttendedStudents,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
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
      <h1>Attendance Trends: {course_id}</h1>
      <div className="chart">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="not-qualified">
        <h2>Not Qualified to Write Exams</h2>
        <p>{notQualified.length} students</p>
        <ul>
          {notQualified.map((student, index) => (
            <li key={index}>
              {student.name} ({student.indexNumber}) - Missed Classes: {student.missedClasses}
            </li>
          ))}
        </ul>
      </div>
      <div className="detailed-view-link">
        <Link href={`/student-attendance?course_id=${course_id}`}>
          View Detailed Student Attendance
        </Link>
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
        .detailed-view-link, .dashboard-link {
          text-align: center;
          margin-top: 2rem;
        }
        .detailed-view-link a, .dashboard-link a {
          display: inline-block;
          padding: 0.5rem 1rem;
          background-color: #0070f3;
          color: #fff;
          text-decoration: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .detailed-view-link a:hover, .dashboard-link a:hover {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  );
}