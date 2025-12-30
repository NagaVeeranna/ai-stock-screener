import React from 'react';
import { Box, Typography, Stack, IconButton, alpha, Tooltip } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useWatchlistStore } from '../store/useWatchlistStore';

export default function WatchlistWidget() {
  const { watchlist, removeFromWatchlist } = useWatchlistStore();

  const mockTrend = [{ p: 10 }, { p: 14 }, { p: 12 }, { p: 19 }, { p: 15 }, { p: 22 }];

  return (
    <Stack spacing={1.5}>
      {watchlist.map((stock) => {
        const isPositive = (stock.changePercent || 0) >= 0;
        const trendColor = isPositive ? '#10b981' : '#ef4444';

        return (
          <Box key={stock.symbol} sx={cardStyle}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '25%' }}>
              <Box sx={logoStyle}>{stock.symbol.substring(0, 2).toUpperCase()}</Box>
              <Box>
                <Typography fontWeight={900} fontSize="1rem" color="#0f172a">{stock.symbol}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>EQUITY</Typography>
              </Box>
            </Stack>

            <Box sx={{ width: '30%', height: 45 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrend}>
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: trendColor, strokeWidth: 1 }} />
                  <Line type="monotone" dataKey="p" stroke={trendColor} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ textAlign: 'right', width: '25%' }}>
              <Typography fontWeight={900} fontSize="1.1rem">₹{Number(stock.close || stock.price).toLocaleString()}</Typography>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: 1.5, bgcolor: alpha(trendColor, 0.1) }}>
                {isPositive ? <TrendingUpIcon sx={{ fontSize: 14, color: trendColor }} /> : <TrendingDownIcon sx={{ fontSize: 14, color: trendColor }} />}
                <Typography variant="caption" fontWeight={900} sx={{ color: trendColor }}>{isPositive ? '+' : ''}{stock.changePercent || '0.00'}%</Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={0.5} sx={{ width: '15%', justifyContent: 'flex-end' }}>
              <IconButton size="small" sx={{ color: '#94a3b8' }}><NotificationsNoneIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => removeFromWatchlist(stock.symbol)} sx={{ color: alpha('#ef4444', 0.4), '&:hover': { color: '#ef4444' } }}><DeleteOutlineIcon fontSize="small" /></IconButton>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

const cardStyle = {
  p: 2, bgcolor: '#f8fafc', borderRadius: 5, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { bgcolor: '#fff', transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(0,0,0,0.06)', borderColor: alpha('#6366f1', 0.3) }
};

const logoStyle = {
  width: 44, height: 44, borderRadius: 3, bgcolor: alpha('#6366f1', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#6366f1', fontSize: '0.85rem'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return <Box sx={{ bgcolor: '#1e293b', color: '#fff', px: 1, py: 0.5, borderRadius: 1.5, fontSize: '10px', fontWeight: 700 }}>₹{payload[0].value}</Box>;
  }
  return null;
};