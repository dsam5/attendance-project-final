'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('access')
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/attendance/courses',
          {
            headers:{
              'Authorization': `Bearer ${token}`,
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          setCourses(data);
        } else {
          throw new Error('Failed to fetch courses');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <Container> 
      <Typography variant="h4" gutterBottom>
        All Courses
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course ID</TableCell>
                <TableCell>Course Name</TableCell>
                <TableCell>View Attendance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.course_id}>
                  <TableCell>{course.course_id}</TableCell>
                  <TableCell>{course.course_name}</TableCell>
                  <TableCell>
                    <Link href={`/viewByWeek?course_id=${course.course_id}`}>
                      View Attendance
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>

  );
}