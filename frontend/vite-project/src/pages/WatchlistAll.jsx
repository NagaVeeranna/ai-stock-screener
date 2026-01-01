import React from 'react';
import { 
  Box, Container, Typography, Grid, Button, Stack, Breadcrumbs, Link, alpha, Paper 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExploreIcon from '@mui/icons-material/Explore';
import { useNavigate } from 'react-router-dom';
import MainHeader from '../components/MainHeader';
import PortfolioCard from '../components/PortfolioCard';
import { useWatchlistStore } from '../store/useWatchlistStore';

export default function WatchlistAll() {
  const navigate = useNavigate();
  const { watchlist } = useWatchlistStore();

  return (
    <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      {/* Reusing consistent header */}
      <MainHeader title="Portfolio Manager" />
      
      {/* --- REFINED SUB-NAVIGATION BAR --- */}
      <Box sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: '#fff', py: 1.5 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 8 } }}>
           <Breadcrumbs aria-label="breadcrumb">
            <Link 
              underline="hover" 
              color="inherit" 
              onClick={() => navigate('/dashboard')}
              sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', color: '#64748b' }}
            >
              DASHBOARD
            </Link>
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#0f172a' }}>
              STOCK LIST ALL
            </Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ pt: 6, px: { xs: 2, md: 8 } }}>
        {/* --- PROFESSIONAL HEADER SECTION --- */}
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', md: 'flex-end' }} 
          spacing={2}
          mb={6}
        >
          <Box>
            <Typography variant="h3" fontWeight={900} sx={{ color: '#0f172a', letterSpacing: '-2px' }}>
              Stock Portfolio
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
              Currently monitoring <b style={{ color: '#0f172a' }}>{watchlist.length}</b> verified assets.
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ 
              borderRadius: 2.5, px: 3, fontWeight: 800, textTransform: 'none', 
              color: '#64748b', borderColor: '#e2e8f0', bgcolor: '#fff',
              borderWidth: 1.5,
              '&:hover': { borderColor: '#0f172a', color: '#0f172a', borderWidth: 1.5 } 
            }}
          >
            Back to Dashboard
          </Button>
        </Stack>

        {/* --- HIGH-DENSITY GRID --- */}
        <Grid container spacing={3.5}>
          {watchlist.length === 0 ? (
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ 
                p: 12, textAlign: 'center', bgcolor: '#fff', 
                borderRadius: 6, border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <ExploreIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 2 }} />
                <Typography variant="h5" color="#0f172a" fontWeight={800}>
                  No Assets Identified
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 420, mx: 'auto', mt: 1 }}>
                  Your intelligence list is currently empty. Use the AI Screener to analyze the 46-stock universe.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/chat')}
                  sx={{ 
                    borderRadius: 2.5, fontWeight: 800, px: 4, py: 1.2,
                    bgcolor: '#0f172a', textTransform: 'none',
                    '&:hover': { bgcolor: '#1e293b' }
                  }}
                >
                  Explore Market
                </Button>
              </Paper>
            </Grid>
          ) : (
            watchlist.map((stock) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={stock.symbol}>
                <Box sx={{ 
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', 
                  '&:hover': { transform: 'translateY(-6px)' } 
                }}>
                  <PortfolioCard stock={stock} />
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}