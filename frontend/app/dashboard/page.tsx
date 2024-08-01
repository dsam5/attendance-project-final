'use client';
import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, Button, Card, CardContent, CardActions, Typography, AppBar, Toolbar,
  IconButton, Container, Menu, MenuItem, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Fab, Box, CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [fabAnchorEl, setFabAnchorEl] = useState<null | HTMLElement>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [openAddStudent, setOpenAddStudent] = useState(false);
  const [openAddCourse, setOpenAddCourse] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courseYear, setCourseYear] = useState('');
  const [studentExamNumber, setStudentExamNumber] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [classId, setClassId] = useState('');
  const [studentYear, setStudentYear] = useState('');
  const [studentImage, setStudentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ first_name: string; last_name: string; email: string }>({ first_name: '', last_name: '' , email: ''});
  const router = useRouter();

  const token = localStorage.getItem('access');

  // Fetch user data and courses data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get('http://127.0.0.1:8000/auth/profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(userResponse.data);

        const coursesResponse = await axios.get('http://127.0.0.1:8000/attendance/courses/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    handleMenuClose();
    router.push(path);
  };

  const handleTakeAttendance = (courseId: number) => {
    router.push(`/takeAttendance?course_id=${courseId}`);
  };

  const handleFabClick = (event: React.MouseEvent<HTMLElement>) => {
    setFabAnchorEl(event.currentTarget);
  };

  const handleFabMenuClose = () => {
    setFabAnchorEl(null);
  };

  const handleAddStudent = () => {
    handleFabMenuClose();
    setOpenAddStudent(true);
  };

  const handleAddCourse = () => {
    handleFabMenuClose();

    setOpenAddCourse(true);
  };

  const handleCloseDialog = () => {
    setOpenAddStudent(false);
    setOpenAddCourse(false);
  };

  const handleCourseIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value;
    setCourseId(id);
    if (id) {
      const level = parseInt(id.charAt(0), 10);
      if (!isNaN(level)) {
        setCourseName(level.toString());
      }
    }
  };

  const handleStudentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStudentImage(e.target.files[0]);
    }
  };

  const handleAddCourseSubmit = async () => {
    setLoading(true);
    try {
      
      const formData = new FormData()
      formData.append('course_id',courseId);
      formData.append('course_name',courseName);
      formData.append('course_year',courseYear);

    // Sending POST request to the backend to add a new course
    const response = await fetch('http://127.0.0.1:8000/attendance/courses/add/ ', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 'Content-Type': 'application/json',
      },
      body: formData,
    });
      console.log(response);
      setOpenAddCourse(false);
      location.reload()
    } catch (error) {
      console.error('Error adding course:', error);
    }
    setLoading(false);
  };


  const handleAddStudentSubmit = async () => {
  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('student_exam_number', studentExamNumber);
    formData.append('student_number', studentNumber);
    formData.append('firstname', firstName);
    formData.append('lastname', lastName);
    formData.append('class_id', classId);
    formData.append('student_year', studentYear);
    if (studentImage) {
      formData.append('image', studentImage);
    }

    // Logging form data to verify the values
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch('http://127.0.0.1:8000/attendance/students/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 'Content-Type': 'multipart/form-data'
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add student: ${errorText}`);
    }

    console.log('Student added successfully');
    setOpenAddStudent(false);
    router.push('/all-students');
  } catch (error) {
    console.error('Error adding student:', error);
  }
  setLoading(false);
};


  const clearLocalStorage = () =>{
    localStorage.removeItem('email');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('reset_code');
  }
  
  const avatarText = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;

  return (
    <div style={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ marginBottom: '2rem' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Attendance System
          </Typography>
          <Avatar>{avatarText}</Avatar>
          <Typography variant="h6" style={{ marginLeft: '1rem' }}>
            {`${user.first_name} ${user.last_name}`}
          </Typography>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            style={{ zIndex: 1100 }}
          >
            <MenuItem onClick={() => handleNavigation('/inspectRecords')}>Inspect Records</MenuItem>
            <MenuItem onClick={() => {
              clearLocalStorage();
              handleNavigation('/login')
              }
            }>Log out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search courses"
              variant="outlined"
              InputProps={{
                style: { background: '#fff' }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {courses.filter(course => course.course_name.toLowerCase().includes(searchQuery.toLowerCase())).map((course) => (
                <Grid item key={course.course_id} xs={12} sm={6} md={4}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {course.course_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Level/Year: {course.course_year}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Course code: {course.course_id}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button variant="contained"
                        color="primary" size="small" onClick={() => handleTakeAttendance(course.course_id)}  fullWidth>Take Attendance  </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Box position="fixed" bottom={16} right={16}>
        <Fab color="primary" onClick={handleFabClick}>
          <AddIcon />
        </Fab>
      </Box>
      <Menu
        anchorEl={fabAnchorEl}
        open={Boolean(fabAnchorEl)}
        onClose={handleFabMenuClose}
        style={{ zIndex: 1100 }}
      >
        <MenuItem onClick={handleAddStudent}>Add Student</MenuItem>
        <MenuItem onClick={handleAddCourse}>Add Course</MenuItem>
      </Menu>
      <Dialog open={openAddStudent} onClose={handleCloseDialog}>
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Student Exam Number"
            type="text"
            fullWidth
            value={studentExamNumber}
            onChange={(e) => setStudentExamNumber(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Student Number"
            type="text"
            fullWidth
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
          <TextField
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Class ID"
            type="text"
            fullWidth
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Student Year"
            type="text"
            fullWidth
            value={studentYear}
            onChange={(e) => setStudentYear(e.target.value)}
          />
          <input
            accept="image/*"
            type="file"
            onChange={handleStudentImageChange}
            style={{ marginTop: '1rem' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
          <Button onClick={handleAddStudentSubmit} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAddCourse} onClose={handleCloseDialog}>
        <DialogTitle>Add Course</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Course Name"
            type="text"
            fullWidth
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Course ID"
            type="text"
            fullWidth
            value={courseId}
            onChange={handleCourseIdChange}
          />
          <TextField
            margin="dense"
            label="Level/Year"
            type="text"
            fullWidth
            value={courseYear}
            onChange={(e) => setCourseYear(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
          <Button onClick={handleAddCourseSubmit} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
