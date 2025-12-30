import React from 'react';
import { Card, CardContent, Stack, Box, Typography, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function PortfolioCard({ stock }) {
  const isPositive = (stock.changePercent || 0) >= 0;
  const trendColor = isPositive ? '#10b981' : '#ef4444';
  const mockTrend = [{p:10}, {p:15}, {p:13}, {p:20}, {p:18}, {p:25}];

  return (
    <Card sx={{ 
      minWidth: 260, 
      borderRadius: 6, 
      border: '1px solid #f1f5f9', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      flexShrink: 0,
      transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box sx={{ 
            p: 1.2, borderRadius: 3, bgcolor: alpha('#6366f1', 0.1), 
            color: '#6366f1', display: 'flex', boxShadow: `inset 0 0 0 1px ${alpha('#6366f1', 0.1)}` 
          }}>
            <TrendingUpIcon fontSize="small" />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1, color: '#0f172a' }}>
              ₹{Number(stock.close).toLocaleString()}
            </Typography>
            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1 }}>
              {stock.symbol}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ height: 45, mb: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockTrend}>
              <Line type="monotone" dataKey="p" stroke={trendColor} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
           <Box sx={{ px: 1.2, py: 0.5, borderRadius: 1.5, bgcolor: alpha(trendColor, 0.1) }}>
             <Typography variant="caption" fontWeight={900} sx={{ color: trendColor }}>
               {isPositive ? '▲' : '▼'} {stock.changePercent || '2.40'}%
             </Typography>
           </Box>
           <Typography variant="caption" color="text.secondary" fontWeight={800}>24 hrs</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}