'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Typography, Box, Button, Paper } from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles'; // Import necessary modules

// Create a custom theme instance
const theme = createTheme();

const StyledContainer = styled(Box)(({ theme }) => ({
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f0f2f5',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '2rem',
  borderRadius: '10px',
  boxShadow: theme.shadows[3], 
  backgroundColor: '#fff',
  maxWidth: '600px',
  width: '100%',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: '1rem 2rem',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 'bold',
  boxShadow: theme.shadows[3], 
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[5], 
    transform: 'translateY(-2px)',
  },
}));

export default function InspectRecordsPage() {
  const searchParams = useSearchParams();
  const course = searchParams.get('course');

  return (
    <ThemeProvider theme={theme}> {}
      <StyledContainer>
        <StyledPaper elevation={3}>
          <Typography variant="h4" component="h1" sx={{ marginBottom: '2rem', textAlign: 'center', fontWeight: 'bold' }}>
            Inspect Previous Records: {course}
          </Typography>
          <Box className="actions" sx={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href={`/viewByCourse?course=${course}`} passHref>
              <StyledButton variant="contained" color="primary">
                View By Course
              </StyledButton>
            </Link>
            <Link href={`/viewByWeek?course=${course}`} passHref>``
              <StyledButton variant="contained" color="primary">
                View By Week
              </StyledButton>
            </Link>
          </Box>
        </StyledPaper>
      </StyledContainer>
    </ThemeProvider>
  );
}