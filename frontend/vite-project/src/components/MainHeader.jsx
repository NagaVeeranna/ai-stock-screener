import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, alpha } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function MainHeader({ title = 'AI Stock Screener' }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout(); 
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: alpha('#fff', 0.8), 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid',
        borderColor: alpha('#e2e8f0', 0.8),
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 5 } }}>
        <Typography 
          variant="h6" 
          sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: -0.5, cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          {title}
        </Typography>

        <Box>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon sx={{ fontSize: 20 }} />}
            sx={{ 
              textTransform: 'none', fontWeight: 700, fontSize: '0.875rem',
              color: '#ef4444', borderRadius: 2, px: 2, py: 0.8,
              '&:hover': { bgcolor: alpha('#ef4444', 0.05), color: '#dc2626' } 
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}