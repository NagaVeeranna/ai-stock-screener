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
  alpha,
  Paper
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useNavigate } from "react-router-dom";

import MainHeader from "../components/MainHeader";
import api from "../services/api";

/* Charts & Components */
import TopStocksBar from "../components/charts/TopStocksBar";
import VolumePie from "../components/charts/VolumePie";
import PortfolioCard from "../components/PortfolioCard"; // 🔥 New landscape card
import { getTopStocks, getVolumeData } from "../services/analyticsApi";
import { useWatchlistStore } from "../store/useWatchlistStore";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topStocks, setTopStocks] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const navigate = useNavigate();
  
  const { watchlist } = useWatchlistStore();

  useEffect(() => {
    api.post("/chat", { query: "all stocks" }).then((res) => {
      const rows = res.data?.data || [];
      if (!rows.length) return setStats({});

      const sortedByPrice = [...rows].sort((a, b) => Number(b.close || 0) - Number(a.close || 0));
      const highestPrice = sortedByPrice[0];
      const lowestPrice = sortedByPrice[sortedByPrice.length - 1];
      const highestVolume = [...rows].sort((a, b) => Number(b.volume || 0) - Number(a.volume || 0))[0];

      setStats({
        total: rows.length,
        highestPrice,
        lowestPrice,
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
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
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

        {/* --- 1. COMPACT STATUS BAR (KPI + MARKET INSIGHTS) --- */}
        <Grid container spacing={2} mb={6}>
          <Grid item xs={12} sm={6} md={2}>
            <KpiCard title="Universe" value={stats?.total} icon={<AutoGraphIcon />} color="#6366f1" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <KpiCard title="AI Signals" value="Optimal" icon={<AccountBalanceWalletIcon />} color="#ec4899" />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3.75}>
            <InsightItem 
              title="Global Market High" 
              stock={stats?.highestPrice} 
              icon={<TrendingUpIcon sx={{ color: "#10b981" }} />} 
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3.75}>
            <InsightItem 
              title="Global Market Low" 
              stock={stats?.lowestPrice} 
              icon={<TrendingDownIcon sx={{ color: "#ef4444" }} />} 
              color="#ef4444"
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* 2. TOP ROW: DUAL VISUALIZATIONS */}
          <Grid item xs={12} lg={8.5}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 8, border: "1px solid #f1f5f9", bgcolor: '#fff', height: '100%' }}>
              <Typography variant="h6" fontWeight={800} color="#0f172a" mb={4}>Price Leaders</Typography>
              <Box sx={{ height: 420 }}><TopStocksBar data={topStocks} /></Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={3.5}>
            <Card sx={{ borderRadius: 8, border: "1px solid #f1f5f9", height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={800} mb={3}>Volume Mix</Typography>
                <Box sx={{ height: 420 }}><VolumePie data={volumeData} /></Box>
              </CardContent>
            </Card>
          </Grid>

          {/* --- 3. BOTTOM ROW: LANDSCAPE WATCHLIST PORTFOLIO --- */}
          <Grid item xs={12} sx={{ mt: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
               <Typography variant="h5" fontWeight={900} color="#0f172a">Watchlist Portfolio</Typography>
               <Button variant="text" sx={{ fontWeight: 800, textTransform: 'none' }}>Expand View</Button>
            </Stack>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              overflowX: 'auto', 
              pb: 4, 
              px: 1,
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#6366f1', 0.2), borderRadius: '10px' }
            }}>
              {watchlist.length === 0 ? (
                <Box sx={{ p: 6, width: '100%', textAlign: 'center', border: '2px dashed #f1f5f9', borderRadius: 8 }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>No assets currently tracked.</Typography>
                </Box>
              ) : (
                watchlist.map((stock) => <PortfolioCard key={stock.symbol} stock={stock} />)
              )}
            </Box>
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

/* ---------- COMPACT REUSABLE COMPONENTS ---------- */

function KpiCard({ title, value, color, icon }) {
  return (
    <Card sx={{ borderRadius: 7, border: '1px solid #f1f5f9', height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
           <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: alpha(color, 0.1), color: color, display: 'flex' }}>
             {icon}
           </Box>
           <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
             {title}
           </Typography>
        </Stack>
        <Typography variant="h5" fontWeight={900} sx={{ color: '#0f172a' }}>
           {value ?? <Skeleton width="40px" />}
        </Typography>
      </CardContent>
    </Card>
  );
}

function InsightItem({ title, stock, icon, color }) {
  return (
    <Card sx={{ borderRadius: 7, border: '1px solid #f1f5f9', height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
        <Box sx={{ p: 1, borderRadius: 3, bgcolor: alpha(color, 0.1), display: 'flex' }}>
          {icon}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="h6" fontWeight={900} sx={{ color: '#0f172a' }}>
              {stock ? stock.symbol : <Skeleton width="60px" />}
            </Typography>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: color }}>
              {stock ? `₹${stock.close}` : ""}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

const fabStyle = {
  position: 'fixed', bottom: 40, right: 40, borderRadius: 4, px: 3, py: 2,
  boxShadow: '0 20px 40px rgba(79, 70, 229, 0.4)', textTransform: 'none',
  fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
};