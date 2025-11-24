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
      background: 'linear-gradient(135deg, rgba(255,98,0,0.1) 0%, rgba(255,152,0,0.05) 100%)',
      //backdropFilter: 'blur(8px)',
      zIndex: 1400, // MUI z-index for modals
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        p: 4,
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(255,98,0,0.25)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,98,0,0.2)',
      }}
    >
      <CircularProgress
        size={64}
        thickness={4}
        sx={{
          color: '#FF6200',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography
        variant="h5"
        sx={{
          background: 'linear-gradient(90deg, #FF6200, #FF8A00)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          letterSpacing: '0.5px',
        }}
      >
        Loading...
      </Typography>
    </Box>
  </Box>
);


export default CustomLoader