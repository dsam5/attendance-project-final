'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Button } from '@mui/material';
import Link from 'next/link';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRouter } from 'next/navigation';

export default function StudentAttendance() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const course_id = searchParams.get('course_id');

  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await fetch(`http://127.0.0.1:8000/attendance/track-full/${course_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setAttendanceData(data);
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to fetch attendance data: ${errorText}`);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (course_id) {
      fetchAttendanceData();
    } else {
      setLoading(false); // Set loading to false if course_id is not available
    }
  }, [course_id]);

  // Extract unique dates from all sessions
  const getDates = () => {
    if (attendanceData && attendanceData.records.length > 0) {
      const sessions = attendanceData.records.map(record => record.sessions);
      const allDates = new Set();
      sessions.forEach(session => {
        Object.keys(session).forEach(date => {
          allDates.add(date);
        });
      });
      return Array.from(allDates);
    }
    return [];
  };

  const dates = getDates();

  const today = new Date();

  const handleDownloadPdf = () => {
    const pdf = new jsPDF('landscape');
    
    // Add header text
    const headerText = `Student Attendance for Course: ${attendanceData?.course_name || 'no course found '} as at ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    pdf.text(headerText, 10, 10);

    // Prepare table data
    const tableColumn = ["Index Number", "Student Name", ...dates, "Total Attended", "Total Missed", "Total Sessions"];
    const tableRows = [];

    attendanceData?.records?.forEach(record => {
      const rowData = [
        record.student_exam_number,
        record.student_name,
        ...dates.map(date => record.sessions[date] || 'N/A'),
        record.summary.total_attended,
        record.summary.total_missed,
        record.summary.total_attended + record.summary.total_missed
      ];
      tableRows.push(rowData);
    });

    // Add table to PDF
    pdf.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      margin: { top: 20 }
    });

    // Generate filename with the format "attendance_{courseID}_yearmonthday_hourminsec"
    const date = new Date();
    const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
    const fileName = `attendance_${course_id}_${formattedDate}_${formattedTime}.pdf`;

    // Save the PDF
    pdf.save(fileName);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Student Attendance for {attendanceData?.course_id || 'course id'}: {attendanceData?.course_name || 'no course found '} {' '}
        as at {today.getDate()}/{today.getMonth() + 1}/{today.getFullYear()}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer component={Paper} style={{ width: '95%', margin: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Index Number</TableCell>
                  <TableCell>Student Name</TableCell>
                  {dates.map((date) => (
                    <TableCell key={date}>{date}</TableCell>
                  ))}
                  <TableCell>Total Attended</TableCell>
                  <TableCell>Total Missed</TableCell>
                  <TableCell>Total Sessions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData?.records?.map((record) => (
                  <TableRow key={record.student_exam_number} sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                    <TableCell>{record.student_exam_number}</TableCell>
                    <TableCell>{record.student_name}</TableCell>
                    {dates.map((date) => (
                      <TableCell key={date}>{record.sessions[date] || 'N/A'}</TableCell>
                    ))}
                    <TableCell>{record.summary.total_attended}</TableCell>
                    <TableCell>{record.summary.total_missed}</TableCell>
                    <TableCell>{record.summary.total_attended + record.summary.total_missed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button onClick={handleDownloadPdf} variant="contained" color="primary" style={{ marginTop: '1rem' }}>
            Download as PDF
          </Button>
        </>
      )}
      <Button onClick={()=> router.push('/dashboard')} variant="outlined" color="secondary" style={{ marginTop: '1rem' , marginLeft:'1em'}}>
        Go home
      </Button>
    </Container>
  );
}


/*

<Button onClick={()=> router.push('/dashboard')} variant="outlined" color="secondary" style={{ marginTop: '1rem' , marginLeft:'1em'}}>
        Go home
      </Button>
*/