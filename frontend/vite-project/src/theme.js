import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#1E3A8A", // deep finance blue
    },

    secondary: {
      main: "#F97316", // action orange
    },

    info: {
      main: "#0284C7",
    },

    success: {
      main: "#16A34A",
    },

    background: {
      default: "#f7fbff",
      paper: "#ffffff",
    },
  },

  typography: {
    fontFamily: "Inter, Roboto, system-ui, -apple-system, sans-serif",

    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },

    body1: {
      fontSize: 15,
    },

    body2: {
      fontSize: 14,
      color: "#475569",
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    /* ---------- BUTTONS ---------- */
    MuiButton: {
      defaultProps: {
        disableElevation: false,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          fontWeight: 600,
          paddingLeft: 18,
          paddingRight: 18,
          transition: "all 0.2s ease",

          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 22px rgba(0,0,0,0.15)",
          },
        },
      },
    },

    /* ---------- CARDS ---------- */
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
          transition: "all 0.25s ease",

          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 14px 32px rgba(15,23,42,0.15)",
          },
        },
      },
    },

    /* ---------- PAPER (CHAT, PANELS) ---------- */
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },

    /* ---------- TEXT INPUTS ---------- */
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#ffffff",
        },
      },
    },

    /* ---------- CHIPS ---------- */
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
      },
    },

    /* ---------- APP BAR ---------- */
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#ffffff",
          color: "#0f172a",
          boxShadow: "0 4px 18px rgba(15,23,42,0.08)",
        },
      },
    },
  },
});

export default theme;
