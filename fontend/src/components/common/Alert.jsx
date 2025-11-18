import React, { useState } from 'react';
import {
  Snackbar,
  Alert as MuiAlert,
  AlertTitle,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { theme } from '../../theme/theme';

const Alert = ({ open, onClose, severity = 'info', title, message, autoHideDuration = 6000 }) => {
  const [stateOpen, setStateOpen] = useState(open);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    onClose?.();
    setStateOpen(false);
  };

  const action = (
    <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      open={stateOpen || open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ '& .MuiAlert-root': { borderRadius: theme.borderRadius.medium } }}
    >
      <MuiAlert
        onClose={handleClose}
        severity={severity}
        sx={{
          width: '100%',
          backgroundColor: severity === 'error' ? theme.colors.error : 
                           severity === 'success' ? theme.colors.success :
                           severity === 'warning' ? theme.colors.warning : theme.colors.primary,
          color: theme.colors.white,
        }}
        action={action}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;