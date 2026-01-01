import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, Container, Typography, Stack, ToggleButton, ToggleButtonGroup, 
  IconButton, alpha, Grid, CircularProgress, Paper, Divider 
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from "../services/api";

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [quarters, setQuarters] = useState(4);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async (qCount) => {
    setLoading(true);
    try {
      const res = await api.post("/chat", { 
          query: `${symbol} history`, 
          quarters: qCount,
          keywords: [symbol] 
      });
      setHistory(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) { setHistory([]); }
    finally { setLoading(false); }
  }, [symbol]);

  useEffect(() => { if (symbol) fetchHistory(quarters); }, [fetchHistory, quarters, symbol]);

  if (loading) return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: '#0f172a' }} thickness={2} />
    </Box>
  );

  // ✅ DYNAMIC COLOR LOGIC
  const latest = history[history.length - 1] || {};
  const first = history[0] || {};
  const isPositive = (latest.close || 0) >= (first.close || 0);
  const statusColor = isPositive ? '#10b981' : '#ef4444'; 
  const changePercent = first.close ? ((latest.close - first.close) / first.close * 100).toFixed(2) : 0;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', color: '#0f172a', pb: 10 }}>
      {/* Navigation Bar - Refined Glass Effect */}
      <Box sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: alpha('#fff', 0.8), backdropFilter: 'blur(8px)', sticky: 'top', zIndex: 10, py: 2 }}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
              <ArrowBackIcon fontSize="inherit" />
            </IconButton>
            <Typography variant="body2" fontWeight={700} color="text.secondary">
              MARKET INTELLIGENCE / <span style={{ color: '#0f172a' }}>{symbol?.toUpperCase()}</span>
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 6 }}>
        {/* Header Section - High Impact Typography */}
        <Grid container spacing={4} alignItems="flex-end" mb={6}>
          <Grid item xs={12} md={7}>
            <Typography variant="overline" fontWeight={900} sx={{ color: '#64748b', letterSpacing: 2 }}>
              NSE INDIA: {symbol}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="baseline">
              <Typography variant="h2" fontWeight={900} sx={{ color: '#1e293b', letterSpacing: '-2.5px' }}>
                ₹{latest.close?.toLocaleString()}
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: statusColor, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isPositive ? '↑' : '↓'} {Math.abs(changePercent)}%
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mt: 1 }}>
              Market Sentiment: <b style={{color: statusColor, textTransform: 'uppercase'}}>{isPositive ? 'Bullish' : 'Bearish'}</b>
            </Typography>
          </Grid>

          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
            <ToggleButtonGroup
              value={quarters}
              exclusive
              onChange={(e, v) => v && setQuarters(v)}
              size="small"
              sx={{ 
                bgcolor: '#fff', p: 0.5, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                '& .MuiToggleButton-root': { border: 'none', px: 3, fontWeight: 800, borderRadius: '8px !important', textTransform: 'none', color: '#64748b', '&.Mui-selected': { bgcolor: '#0f172a', color: '#fff' } }
              }}
            >
              <ToggleButton value={2}>6 Months</ToggleButton>
              <ToggleButton value={4}>1 Year</ToggleButton>
              <ToggleButton value={12}>3 Years</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Dynamic Sentiment Chart - Institutional Grade */}
        
        <Paper elevation={0} sx={{ p: 4, borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: '#fff', mb: 8, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
          <Box sx={{ height: 480, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={statusColor} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={statusColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: `1px solid #e2e8f0`, borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '12px' }}
                  itemStyle={{ fontWeight: 900, color: statusColor }}
                  cursor={{ stroke: statusColor, strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="close" 
                  stroke={statusColor} 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#sentimentGradient)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Performance Metrics - Soft Card Interaction */}
        <Grid container spacing={3}>
          {[
            { label: 'High Valuation', key: 'high', icon: '↑' },
            { label: 'Low Valuation', key: 'low', icon: '↓' },
            { label: 'Trade Volume', key: 'volume', icon: '▤' },
            { label: 'Money Flow', key: 'turnover', icon: '₹' }
          ].map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Box sx={{ 
                p: 3.5, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 6,
                transition: 'all 0.3s ease', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                '&:hover': { borderColor: statusColor, transform: 'translateY(-6px)', boxShadow: `0 20px 25px -5px ${alpha(statusColor, 0.1)}` }
              }}>
                <Typography variant="caption" fontWeight={900} color="#94a3b8" sx={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ mt: 1, color: '#1e293b' }}>
                  {stat.icon} {Math.max(...history.map(h => h[stat.key] || 0)).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}