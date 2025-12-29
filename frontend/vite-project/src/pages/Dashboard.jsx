import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Skeleton,
  Container,
  IconButton,
  alpha,
  Paper
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import StarIcon from "@mui/icons-material/Star";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useNavigate } from "react-router-dom";

import MainHeader from "../components/MainHeader";
import api from "../services/api";

/* Charts & Store */
import TopStocksBar from "../components/charts/TopStocksBar";
import VolumePie from "../components/charts/VolumePie";
import { getTopStocks, getVolumeData } from "../services/analyticsApi";
import { useWatchlistStore } from "../store/useWatchlistStore";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topStocks, setTopStocks] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const navigate = useNavigate();
  
  const { watchlist, removeFromWatchlist } = useWatchlistStore();

  useEffect(() => {
    api.post("/chat", { query: "all stocks" }).then((res) => {
      const rows = res.data?.data || [];
      if (!rows.length) return setStats({});

      const highestPrice = [...rows].sort((a, b) => Number(b.close || 0) - Number(a.close || 0))[0];
      const highestVolume = [...rows].sort((a, b) => Number(b.volume || 0) - Number(a.volume || 0))[0];

      setStats({
        total: rows.length,
        highestPrice,
        highestVolume,
      });
    });

    getTopStocks().then((res) => setTopStocks(res.data || []));
    getVolumeData().then((res) => setVolumeData(res.data || []));
  }, []);

  return (
    <Box sx={{ backgroundColor: "#fdfdff", minHeight: "100vh", pb: 10 }}>
      <MainHeader title="AI Stock Screener" />

      <Container maxWidth="xl" sx={{ pt: 4 }}>
        
        {/* HEADER SECTION */}
        <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={2} alignItems="center">
               <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-1.5px', color: '#0f172a' }}>
                 Market Intelligence
               </Typography>
               <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: alpha('#10b981', 0.1), display: 'flex', alignItems: 'center', gap: 1 }}>
                   <Box sx={{ width: 8, height: 8, bgcolor: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                   <Typography variant="caption" fontWeight={700} color="#10b981">LIVE</Typography>
               </Box>
            </Stack>
            <Typography variant="body1" sx={{ color: '#64748b', mt: 0.5, fontWeight: 500 }}>
              AI-driven insights for data-backed decisions
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            onClick={() => navigate("/upload")} 
            startIcon={<CloudUploadIcon />}
            sx={{ 
                borderRadius: 4, px: 4, py: 1.5, textTransform: 'none', fontWeight: 800, 
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Upload CSV Data
          </Button>
        </Box>

        {/* KPI SECTION */}
        <Grid container spacing={3} mb={6}>
          <KpiCard title="Universe Size" value={stats?.total} icon={<AutoGraphIcon />} color="#6366f1" />
          <KpiCard title="Market High" value={stats?.highestPrice?.close ? `₹${stats.highestPrice.close}` : null} icon={<TrendingUpIcon />} color="#10b981" />
          <KpiCard title="Peak Volume" value={stats?.highestVolume?.volume?.toLocaleString()} icon={<BarChartIcon />} color="#f59e0b" />
          <KpiCard title="AI Signals" value="Optimal" icon={<AccountBalanceWalletIcon />} color="#ec4899" />
        </Grid>

        <Grid container spacing={4}>
          
          {/* 1. FULL WIDTH: PRICE LEADERS CHART */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                  p: 4, borderRadius: 8, border: "1px solid #f1f5f9", 
                  bgcolor: '#fff', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.02)' 
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                  <Typography variant="h6" fontWeight={800} color="#0f172a">Price Leaders</Typography>
                  <Typography variant="caption" sx={{ bgcolor: '#f1f5f9', px: 2, py: 0.5, borderRadius: 2, fontWeight: 700 }}>FULL MARKET SCOPE</Typography>
              </Stack>
              <Box sx={{ height: 450 }}>
                <TopStocksBar data={topStocks} />
              </Box>
            </Paper>
          </Grid>

          {/* 2. UNDER CHART: INSIGHTS ROW */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <InsightItem 
                title="Bullish Conviction" 
                stock={stats?.highestPrice} 
                icon={<TrendingUpIcon sx={{ color: "#6366f1" }} />} 
              />
              <InsightItem 
                title="Liquidity Surge" 
                stock={stats?.highestVolume} 
                icon={<BarChartIcon sx={{ color: "#10b981" }} />} 
              />
            </Grid>
          </Grid>

          {/* 3. UNDER INSIGHTS: WATCHLIST & VOLUME SIDE-BY-SIDE */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 8, border: '1px solid #f1f5f9', minHeight: 400 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" justifyContent="space-between" mb={4} alignItems="center">
                  <Typography variant="h6" fontWeight={800}>Personal Watchlist</Typography>
                  <StarIcon sx={{ color: '#f59e0b' }} />
                </Stack>
                
                {watchlist.length === 0 ? (
                  <Box textAlign="center" py={8} sx={{ border: '2px dashed #f1f5f9', borderRadius: 6 }}>
                    <Typography variant="body2" color="text.secondary">Add tickers from the AI Chat to track performance.</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {watchlist.map((stock) => (
                      <Grid item xs={12} sm={6} key={stock.symbol}>
                        <Box sx={watchlistItemStyle}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* CUSTOM SHAPE ICON */}
                            <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', borderRadius: '3px', transform: 'rotate(45deg)' }} />
                            <Box>
                              <Typography fontWeight={800}>{stock.symbol}</Typography>
                              <Typography variant="caption" color="text.secondary">₹{stock.close || stock.price}</Typography>
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => removeFromWatchlist(stock.symbol)} sx={{ color: '#ef4444' }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 8, border: "1px solid #f1f5f9", minHeight: 400 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={800} mb={3}>Volume Mix Distribution</Typography>
                <Box sx={{ height: 320 }}>
                  <VolumePie data={volumeData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

        </Grid>

        <Button
          variant="contained"
          onClick={() => navigate("/chat")}
          sx={fabStyle}
          startIcon={<ChatBubbleIcon />}
        >
          Ask AI Advisor
        </Button>
      </Container>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </Box>
  );
}

/* ---------- STYLES & COMPONENTS ---------- */

const watchlistItemStyle = {
  p: 2, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #f1f5f9',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  transition: '0.2s', '&:hover': { bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }
};

const fabStyle = {
  position: 'fixed', bottom: 40, right: 40, borderRadius: 4, px: 3, py: 2,
  boxShadow: '0 20px 40px rgba(79, 70, 229, 0.4)', textTransform: 'none',
  fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
};

function KpiCard({ title, value, color, icon }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ borderRadius: 7, border: '1px solid #f1f5f9' }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>{title}</Typography>
                <Typography variant="h4" fontWeight={900} sx={{ mt: 1, color: '#0f172a' }}>{value ?? <Skeleton width="80px" />}</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 4, bgcolor: alpha(color, 0.1), color: color, display: 'flex' }}>{icon}</Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}

function InsightItem({ title, stock, icon }) {
  return (
    <Grid item xs={12} md={6}>
      <Card sx={{ borderRadius: 7, border: '1px solid #f1f5f9', transition: '0.3s' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3.5 }}>
          <Box sx={{ p: 2, borderRadius: 5, bgcolor: alpha(icon.props.sx.color, 0.1), display: 'flex' }}>{icon}</Box>
          <Box>
            <Typography variant="caption" fontWeight={800} color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
              {stock ? stock.symbol : <Skeleton width={120} />}
              <span style={{ marginLeft: '12px', fontSize: '1.1rem', color: '#10b981', fontWeight: 700 }}>
                {stock ? `₹${stock.close}` : ""}
              </span>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}