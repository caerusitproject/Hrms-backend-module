import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material';

// Custom Loader Component
const CustomLoader = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      //backgroundColor: 'rgba(255, 165, 0, 0.1)', // Light orange background with opacity
      zIndex: 1400, // MUI z-index for modals
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <CircularProgress
        size={48}
        sx={{
          color: '#FF6200', // Vibrant orange for the spinner
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: '#E65100', // Darker orange for text
          fontWeight: 'bold',
        }}
      >
        Loading...
      </Typography>
    </Box>
  </Box>
);


export default CustomLoader