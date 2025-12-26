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
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import MainHeader from "../components/MainHeader";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .post("/chat", { query: "all stocks" })
      .then((res) => {
        const rows = res.data?.data || [];
        if (!rows.length) return setStats({});

        const highestPrice = [...rows].sort(
          (a, b) => Number(b.close || 0) - Number(a.close || 0)
        )[0];

        const highestVolume = [...rows].sort(
          (a, b) => Number(b.volume || 0) - Number(a.volume || 0)
        )[0];

        setStats({
          total: rows.length,
          highestPrice,
          highestVolume,
        });
      })
      .catch(() => setStats({}));
  }, []);

  return (
    <Box>
      <MainHeader title="AI Stock Screener Dashboard" />

      {/* PAGE HEADER */}
      <Box px={4} pt={4}>
        <Typography variant="h4" fontWeight={800} mb={1}>
          Welcome back 👋
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Here’s a snapshot of your stock universe today
        </Typography>
      </Box>

      <Box p={4} sx={{ maxWidth: 1200 }}>
        {/* KPI CARDS */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="📊 Total Stocks" value={stats?.total} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="💰 Highest Price"
              value={
                stats?.highestPrice
                  ? `₹ ${stats.highestPrice.close}`
                  : null
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="📈 Highest Volume"
              value={stats?.highestVolume?.volume}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="🤖 AI Insights" value="Active" />
          </Grid>
        </Grid>

        {/* INSIGHTS */}
        <Box mt={5}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Market Insights
          </Typography>

          <Grid container spacing={3}>
            <InsightCard
              title="Top Priced Stock"
              icon={<TrendingUpIcon color="primary" />}
              stock={stats?.highestPrice}
            />
            <InsightCard
              title="Most Traded Stock"
              icon={<BarChartIcon color="secondary" />}
              stock={stats?.highestVolume}
            />
          </Grid>
        </Box>

        {/* QUICK ACTIONS */}
        <Box mt={5}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Quick Actions
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => navigate("/upload")}
            >
              Upload CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<ChatBubbleIcon />}
              onClick={() => navigate("/chat")}
            >
              Open Chat Assistant
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

function KpiCard({ title, value }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value ?? <Skeleton width={80} />}
        </Typography>
      </CardContent>
    </Card>
  );
}

function InsightCard({ title, icon, stock }) {
  return (
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            {icon}
            <Box>
              <Typography fontWeight={600}>{title}</Typography>
              {stock ? (
                <Typography fontSize={14} color="text.secondary">
                  {stock.symbol} — Close ₹{stock.close} | Vol {stock.volume}
                </Typography>
              ) : (
                <Skeleton width={200} />
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}
