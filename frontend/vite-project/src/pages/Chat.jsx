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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useToast } from "../components/ToastProvider";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const bottomRef = useRef(null);

  const suggestedQueries = [
    "high stocks",
    "low stocks",
    "top 5 stocks",
    "bajaj stocks",
    "stocks with volume > 1000000",
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

      setMessages((prev) => [
        ...prev,
        { role: "assistant", payload: data },
      ]);
    } catch (err) {
      toast?.showToast("Server not responding", "error");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Unable to reach server" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        AI Stock Assistant
      </Typography>

      {/* CHAT WINDOW */}
      <Paper sx={{ height: 480, overflowY: "auto", p: 2, mb: 2, borderRadius: 3 }}>
        <Stack spacing={2}>
          {/* Empty State */}
          {messages.length === 0 && (
            <Box>
              <Typography color="text.secondary" fontSize={14}>
                Try asking:
              </Typography>
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                {suggestedQueries.map((q) => (
                  <Chip
                    key={q}
                    label={q}
                    onClick={() => ask(q)}
                    clickable
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Messages */}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <Box key={i} alignSelf="flex-end" maxWidth="75%">
                <Paper sx={{ bgcolor: "#e3f2fd", p: 1.5, borderRadius: 2 }}>
                  <Typography>{m.text}</Typography>
                </Paper>
              </Box>
            ) : (
              <Box key={i}>
                <Paper sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2 }}>
                  {/* Assistant message */}
                  {m.payload?.message && (
                    <Typography sx={{ whiteSpace: "pre-line", mb: 1 }}>
                      {m.payload.message}
                    </Typography>
                  )}

                  {/* ✅ INTENT HINT (FIXED) */}
                  {m.payload?.intent && (
                    <Typography fontSize={12} color="text.secondary" mb={1}>
                      Showing results sorted by{" "}
                      <b>{m.payload.intent.replace("_", " ")}</b>
                    </Typography>
                  )}

                  {/* ✅ STOCK RESULTS (RENDER ONLY BY DATA) */}
                  {Array.isArray(m.payload?.data) &&
                    m.payload.data.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Stack spacing={1}>
                          {m.payload.data.map((row, idx) => {
                            const symbol =
                              row.symbol || row.Symbol || "N/A";
                            const close =
                              row.close ?? row.Close ?? "—";
                            const volume =
                              row.volume ?? row.Volume ?? "—";

                            return (
                              <Paper
                                key={idx}
                                variant="outlined"
                                sx={{
                                  p: 1.5,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  borderRadius: 2,
                                }}
                              >
                                <Box>
                                  <Typography fontWeight={600}>
                                    {symbol}
                                  </Typography>
                                  <Typography
                                    fontSize={13}
                                    color="text.secondary"
                                  >
                                    Volume: {volume}
                                  </Typography>
                                </Box>
                                <Chip
                                  icon={<TrendingUpIcon />}
                                  label={`₹ ${close}`}
                                  color="primary"
                                  variant="outlined"
                                />
                              </Paper>
                            );
                          })}
                        </Stack>
                      </>
                    )}
                </Paper>
              </Box>
            )
          )}

          {/* Loading */}
          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography fontSize={13} color="text.secondary">
                Analyzing market data…
              </Typography>
            </Stack>
          )}

          <div ref={bottomRef} />
        </Stack>
      </Paper>

      {/* INPUT */}
      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          placeholder="Ask about stocks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={() => ask()}
          disabled={loading}
        >
          Ask
        </Button>
      </Stack>
    </Box>
  );
}
