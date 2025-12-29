import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 🔥 Added for navigation
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  alpha,
  Paper,
  Fade
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import api from "../services/api";
import { useToast } from "../components/ToastProvider";

export default function UploadCSV() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // success | error
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate(); // 🔥 Initialize navigate hook
  const toast = useToast();

  // Primary upload function
  const upload = async (file) => {
    if (!file) return;

    setUploading(true);
    setStatus(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Ensure multipart/form-data for file buffers
      await api.post("/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("success");
      toast?.showToast("CSV uploaded & embeddings stored", "success");
    } catch (e) {
      console.error(e);
      setStatus("error");
      toast?.showToast("Upload failed. Verify CSV format.", "error");
    } finally {
      setUploading(false);
    }
  };

  // 🔥 FIXED: Clear function logic to reset the form
  const handleClear = () => {
    setStatus(null);
    setFileName("");
    toast?.showToast("Form cleared", "info");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, bgcolor: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        
        {/* HEADER SECTION */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={900} color="#0f172a" gutterBottom>
            Market Data Engine
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Feed the AI core with custom CSV data to generate vector embeddings for semantic screening.
          </Typography>
        </Box>

        <Card sx={{ 
          borderRadius: 6, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
          border: '1px solid #e2e8f0',
          overflow: 'visible'
        }}>
          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            <Stack spacing={4} alignItems="center">
              
              {/* INTERACTIVE DROPZONE AREA */}
              <Paper 
                component="label"
                sx={{
                  width: '100%',
                  py: 8,
                  px: 4,
                  border: '2px dashed',
                  borderColor: status === "success" ? '#10b981' : (status === "error" ? '#ef4444' : '#cbd5e1'),
                  borderRadius: 5,
                  bgcolor: alpha('#f1f5f9', 0.5),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  transition: '0.3s',
                  '&:hover': {
                    bgcolor: alpha('#4f46e5', 0.05),
                    borderColor: 'primary.main',
                  }
                }}
              >
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  disabled={uploading}
                  onChange={(e) => upload(e.target.files[0])}
                />
                
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '50%', 
                  bgcolor: alpha('#4f46e5', 0.1), 
                  mb: 2,
                  display: 'flex',
                  color: 'primary.main'
                }}>
                  <CloudUploadIcon sx={{ fontSize: 40 }} />
                </Box>

                <Typography variant="h6" fontWeight={800} color="#1e293b">
                  {fileName || "Select CSV Market File"}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                  Drag and drop or click to browse your local storage.<br />
                  Maximum file size: 25MB
                </Typography>
              </Paper>

              {/* PROGRESS BAR */}
              {uploading && (
                <Box width="100%" sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={700} color="primary.main" gutterBottom>
                    Generating AI Embeddings...
                  </Typography>
                  <LinearProgress 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: alpha('#4f46e5', 0.1),
                      '& .MuiLinearProgress-bar': { borderRadius: 4 }
                    }} 
                  />
                </Box>
              )}

              {/* SUCCESS STATE */}
              <Fade in={status === "success"}>
                <Box sx={{ 
                  width: '100%', 
                  p: 3, 
                  borderRadius: 4, 
                  bgcolor: alpha('#10b981', 0.05), 
                  border: '1px solid',
                  borderColor: alpha('#10b981', 0.2),
                  display: status === "success" ? 'flex' : 'none',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <CheckCircleIcon color="success" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="success.main">
                      Upload Successful
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      The AI model has processed the data and updated the vector store.
                    </Typography>
                  </Box>
                </Box>
              </Fade>

              {/* ERROR STATE */}
              <Fade in={status === "error"}>
                <Box sx={{ 
                  width: '100%', 
                  p: 3, 
                  borderRadius: 4, 
                  bgcolor: alpha('#ef4444', 0.05), 
                  border: '1px solid',
                  borderColor: alpha('#ef4444', 0.2),
                  display: status === "error" ? 'flex' : 'none',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <ErrorIcon color="error" />
                  <Typography variant="subtitle2" fontWeight={800} color="error.main">
                    Format Error: Please ensure your CSV uses standard UTF-8 encoding.
                  </Typography>
                </Box>
              </Fade>

              {/* ACTION BUTTONS */}
              <Stack direction="row" spacing={2} width="100%">
                 <Button 
                   fullWidth 
                   variant="outlined" 
                   sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, textTransform: 'none' }}
                   onClick={handleClear} // 🔥 Fixed: Reset form state
                 >
                   Clear
                 </Button>
                 <Button 
                   fullWidth 
                   variant="contained" 
                   disabled={uploading}
                   onClick={() => navigate("/dashboard")} // 🔥 Fixed: Redirect to dashboard
                   sx={{ 
                     borderRadius: 3, 
                     py: 1.5, 
                     fontWeight: 700, 
                     textTransform: 'none',
                     bgcolor: '#4f46e5',
                     boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                   }}
                 >
                   View Dashboard
                 </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}