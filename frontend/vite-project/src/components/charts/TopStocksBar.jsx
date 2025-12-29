import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { alpha, Box, Typography } from "@mui/material";
// 🔥 FIXED PATH: Up two levels to reach src/store
import { useWatchlistStore } from "../../store/useWatchlistStore"; 
import { useToast } from "../../components/ToastProvider";

export default function TopStocksBar({ data }) {
  const addToWatchlist = useWatchlistStore((state) => state.addToWatchlist);
  const isWatching = useWatchlistStore((state) => state.isWatching);
  const toast = useToast();

  // 1. Handle Loading/Empty states gracefully
  if (!data || !data.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="caption" color="text.secondary">
          No market data available
        </Typography>
      </Box>
    );
  }

  // 2. Normalize and Sort Data (Ensures the bars match the labels)
  const chartData = data
    .map(item => ({
      ...item,
      // Normalize 'close' or 'price' to a single key for Recharts
      displayPrice: Number(item.price || item.close || 0) 
    }))
    .sort((a, b) => b.displayPrice - a.displayPrice)
    .slice(0, 8);

  const handleBarClick = (entry) => {
    const added = addToWatchlist(entry);
    if (added) {
      toast?.showToast(`${entry.symbol} added to watchlist`, "success");
    } else {
      toast?.showToast(`${entry.symbol} is already being tracked`, "info");
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
        onClick={(state) => {
          if (state && state.activePayload) {
            handleBarClick(state.activePayload[0].payload);
          }
        }}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
            <stop offset="100%" stopColor="#818cf8" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="watchedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="symbol"
          axisLine={false}
          tickLine={false}
          angle={-45}
          textAnchor="end"
          interval={0}
          tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
        />
        
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }} 
        />

        <Tooltip
          cursor={{ fill: alpha('#f1f5f9', 0.6), radius: 8 }}
          contentStyle={{ 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            padding: '12px'
          }}
          itemStyle={{ fontWeight: 700, fontSize: '13px' }}
          labelStyle={{ color: '#1e293b', fontWeight: 800, marginBottom: '4px' }}
          formatter={(value) => [`₹${value.toLocaleString()}`, "Market Price"]}
        />

        <Bar
          dataKey="displayPrice" // 🔥 Updated to use normalized key
          radius={[8, 8, 0, 0]}
          barSize={32}
          style={{ cursor: 'pointer' }}
        >
          {chartData.map((entry, index) => {
            const watching = isWatching(entry.symbol);
            return (
              <Cell 
                key={`cell-${index}`} 
                fill={watching ? "url(#watchedGradient)" : "url(#barGradient)"} 
                style={{ 
                  filter: watching 
                    ? 'drop-shadow(0px 4px 8px rgba(16, 185, 129, 0.3))' 
                    : 'drop-shadow(0px 4px 8px rgba(79, 70, 229, 0.3))',
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}