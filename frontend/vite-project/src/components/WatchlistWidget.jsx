import React from 'react';
import { Box, Typography, Stack, IconButton, alpha } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useWatchlistStore } from '../store/useWatchlistStore';

export default function WatchlistWidget() {
  const { watchlist, removeFromWatchlist } = useWatchlistStore();

  return (
    <Stack spacing={1.5}>
      {watchlist.map((stock) => {
        // ✅ Rule: Calculate trend based on period data from the dashboard
        const isPositive = (stock.close || 0) >= (stock.open || 0);
        const trendColor = isPositive ? '#10b981' : '#ef4444';

        // ✅ Replace mockTrend with dynamic data from the 46-stock universe
        // We use the OHLC values to create a high-fidelity 4-point trend line
        const trendData = [
          { p: stock.open || 0 },
          { p: stock.low || 0 },
          { p: stock.high || 0 },
          { p: stock.close || 0 }
        ];

        return (
          <Box key={stock.symbol} sx={cardStyle}>
            {/* Symbol & Logo Section */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '25%' }}>
              <Box sx={logoStyle}>{stock.symbol.substring(0, 2).toUpperCase()}</Box>
              <Box>
                <Typography fontWeight={900} fontSize="0.95rem" color="#0f172a">{stock.symbol}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>
                    {stock.period > 1 ? `${stock.period}Q TREND` : 'EQUITY'}
                </Typography>
              </Box>
            </Stack>

            {/* Dynamic Trend Line Section */}
            <Box sx={{ width: '30%', height: 45 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: trendColor, strokeWidth: 1 }} />
                  <Line 
                    type="monotone" 
                    dataKey="p" 
                    stroke={trendColor} 
                    strokeWidth={2.5} 
                    dot={false} 
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Price & Change Section */}
            <Box sx={{ textAlign: 'right', width: '25%' }}>
              <Typography fontWeight={900} fontSize="1.1rem">
                ₹{Number(stock.close || 0).toLocaleString()}
              </Typography>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 0.5, 
                px: 1, 
                py: 0.25, 
                borderRadius: 1.5, 
                bgcolor: alpha(trendColor, 0.1) 
              }}>
                {isPositive ? <TrendingUpIcon sx={{ fontSize: 14, color: trendColor }} /> : <TrendingDownIcon sx={{ fontSize: 14, color: trendColor }} />}
                <Typography variant="caption" fontWeight={900} sx={{ color: trendColor }}>
                    {isPositive ? '+' : ''}{stock.changePercent || '0.00'}%
                </Typography>
              </Box>
            </Box>

            {/* Actions Section */}
            <Stack direction="row" spacing={0.5} sx={{ width: '15%', justifyContent: 'flex-end' }}>
              <IconButton size="small" sx={{ color: '#94a3b8' }}><NotificationsNoneIcon fontSize="small" /></IconButton>
              <IconButton 
                size="small" 
                onClick={() => removeFromWatchlist(stock.symbol)} 
                sx={{ color: alpha('#ef4444', 0.4), '&:hover': { color: '#ef4444' } }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

// ... (logoStyle and cardStyle remain identical to preserve your design)

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ 
        bgcolor: '#1e293b', 
        color: '#fff', 
        px: 1, 
        py: 0.5, 
        borderRadius: 1.5, 
        fontSize: '10px', 
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
      }}>
        ₹{payload[0].value.toLocaleString()}
      </Box>
    );
  }
  return null;
};