'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Tab, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function AllStudents() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/attendance/students/');
        if (response.ok) {
          const data = await response.json();
          // console.log(data)
          setStudents(data);
        } else {
          setError('An error occured. Please try again')
          throw new Error('Failed to fetch students');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        All Students
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
                <TableCell>Index Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.student_number}>
                  <TableCell>{student.student_exam_number}</TableCell>
                  <TableCell>{student.lastname} {student.firstname}</TableCell>
                  <TableCell>{student.class_id_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Button onClick={()=> router.push('/dashboard')} variant="outlined" color="secondary" style={{ marginTop: '1rem' , marginLeft:'1em'}}>
        Go home
      </Button>
    </Container>
  );
}