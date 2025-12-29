import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Divider,
  Avatar,
  IconButton,
  alpha,
  Tooltip
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useToast } from "../components/ToastProvider";
import { useWatchlistStore } from "../store/useWatchlistStore";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const bottomRef = useRef(null);
  const addToWatchlist = useWatchlistStore((state) => state.addToWatchlist);

  const suggestedQueries = [
    "top 5 stocks",
    "high volume stocks",
    "stocks under ₹500",
    "bajaj performance",
    "best gainers today",
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const ask = async (customQuery) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", payload: data }]);
    } catch (err) {
      toast?.showToast("AI Service unreachable", "error");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Server connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 100px)', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f8fafc',
      p: { xs: 2, md: 4 } 
    }}>
      
      {/* GLASS HEADER */}
      <Paper sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 4, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        backdropFilter: 'blur(10px)',
        bgcolor: alpha('#fff', 0.8),
        border: '1px solid #e2e8f0',
        boxShadow: 'none'
      }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <SmartToyIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1 }}>
            AI Market Advisor
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Powered by GPT-4 • Real-time Data
          </Typography>
        </Box>
      </Paper>

      {/* CHAT WINDOW */}
      <Paper sx={{ 
        flexGrow: 1, 
        overflowY: "auto", 
        p: 3, 
        mb: 2, 
        borderRadius: 5, 
        bgcolor: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: '10px' }
      }}>
        <Stack spacing={3}>
          {messages.length === 0 && (
            <Box textAlign="center" py={5}>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                How can I help you today?
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Ask about specific tickers, price thresholds, or volume spikes.
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                {suggestedQueries.map((q) => (
                  <Chip
                    key={q}
                    label={q}
                    onClick={() => ask(q)}
                    sx={{ 
                      borderRadius: 2, 
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'primary.main', color: '#fff' }
                    }}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}

          {messages.map((m, i) => (
            <Box key={i} sx={{ 
              display: 'flex', 
              flexDirection: m.role === "user" ? "row-reverse" : "row", 
              gap: 2 
            }}>
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: m.role === "user" ? "secondary.main" : "primary.main",
                fontSize: '1rem'
              }}>
                {m.role === "user" ? <PersonIcon /> : <SmartToyIcon fontSize="small" />}
              </Avatar>

              <Box sx={{ maxWidth: '80%' }}>
                <Paper sx={{ 
                  p: 2, 
                  borderRadius: m.role === "user" ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                  bgcolor: m.role === "user" ? "primary.main" : "#f1f5f9",
                  color: m.role === "user" ? "#fff" : "#1e293b",
                  boxShadow: 'none'
                }}>
                  {m.text && <Typography variant="body2" sx={{ fontWeight: 500 }}>{m.text}</Typography>}
                  
                  {m.payload && (
                    <Box>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-line", fontWeight: 500 }}>
                        {m.payload.message}
                      </Typography>

                      {Array.isArray(m.payload?.data) && m.payload.data.length > 0 && (
                        <Stack spacing={1.5} mt={2}>
                          {m.payload.data.slice(0, 5).map((row, idx) => (
                            <Paper key={idx} variant="outlined" sx={{ 
                              p: 1.5, borderRadius: 3, display: "flex", 
                              justifyContent: "space-between", alignItems: "center",
                              bgcolor: '#fff', '&:hover': { bgcolor: '#f8fafc' }
                            }}>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={800}>{row.symbol || "N/A"}</Typography>
                                <Typography variant="caption" color="text.secondary">Vol: {row.volume?.toLocaleString()}</Typography>
                              </Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontWeight={800} color="primary.main">₹{row.close}</Typography>
                                <Tooltip title="Add to Watchlist">
                                  <IconButton size="small" onClick={() => {
                                    addToWatchlist(row);
                                    toast?.showToast(`${row.symbol} added`, "success");
                                  }}>
                                    <StarBorderIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          ))}

          {loading && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <CircularProgress size={18} thickness={6} sx={{ color: '#fff' }} />
              </Avatar>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Analyzing market data...
              </Typography>
            </Stack>
          )}
          <div ref={bottomRef} />
        </Stack>
      </Paper>

      {/* INPUT AREA */}
      <Stack direction="row" spacing={2} component={Paper} sx={{ 
        p: 1, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' 
      }}>
        <TextField
          fullWidth
          placeholder="Type a command (e.g., 'What are the top gainers?')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            "& .MuiInputBase-input": { fontWeight: 500 }
          }}
        />
        <Button
          variant="contained"
          onClick={() => ask()}
          disabled={loading}
          sx={{ borderRadius: 3, px: 4, minWidth: 100 }}
        >
          {loading ? <CircularProgress size={20} /> : <SendIcon />}
        </Button>
      </Stack>
    </Box>
  );
}