'use client';
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, TextField, Button, CircularProgress, Alert, Box } from '@mui/material';

export default function SignupPage() {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      if (firstName && lastName && username && email && password && confirmPassword) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const response = await fetch('http://127.0.0.1:8000/auth/register/',{
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body: JSON.stringify({
        username,
        password,
        email,
        password2: confirmPassword,
        first_name:firstName,
        last_name:lastName})
        })
        if (!response.ok){
          throw new Error('an error occured while signing you up. Try again.')
        }
        const data = await response.json()
        console.log(data)
        alert('Signup successful! Redirecting to login page...');
        router.push('/login'); // Redirect to the login page
      } else {
        throw new Error('Please fill in all fields');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Signup
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="First Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={firstName}
          onChange={handleFirstNameChange}
        />
        <TextField
          label="Last Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={lastName}
          onChange={handleLastNameChange}
        />
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={username}
          onChange={handleUsernameChange}
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          value={email}
          onChange={handleEmailChange}
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          onChange={handlePasswordChange}
        />
        <TextField
          label="Confirm Password"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
        />
        <Box sx={{ position: 'relative', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Signup'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
