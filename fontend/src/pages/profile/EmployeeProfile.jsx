// EmployeeProfile.jsx
import React, { useState } from 'react';
import EmployeeProfileView from './EmployeeProfileView';
import EmployeeProfileEdit from './EmployeeProfileEdit';
import { Box, Paper } from '@mui/material';
import { theme } from '../../theme/theme';

const EmployeeProfile = () => {
  const [mode, setMode] = useState('view');

  // Layout wrapper for consistent color and padding
  return (
    <Box sx={{ background: '#fff3e0', minHeight: '100vh', py: 4 }}>
      <Paper elevation={0} sx={{ maxWidth: 1100, mx: 'auto', p: 3, background: '#fff3e0', boxShadow: 'none' }}>
        {mode === 'view' ? (
          <EmployeeProfileView onEdit={() => setMode('edit')} />
        ) : (
          <EmployeeProfileEdit onSave={() => setMode('view')} onCancel={() => setMode('view')} />
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeProfile;