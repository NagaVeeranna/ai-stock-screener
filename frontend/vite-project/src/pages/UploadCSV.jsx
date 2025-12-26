import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import api from "../services/api";
import { useToast } from "../components/ToastProvider";

export default function UploadCSV() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // success | error
  const [fileName, setFileName] = useState("");
  const toast = useToast();

  const upload = async (file) => {
    if (!file) return;

    setUploading(true);
    setStatus(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("success");
      toast?.showToast("CSV uploaded & embeddings stored", "success");

    } catch (e) {
      console.error(e);
      setStatus("error");
      toast?.showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Upload Market Data
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Upload cleaned CSV files to generate embeddings and enable AI screening
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <UploadFileIcon sx={{ fontSize: 48, color: "primary.main" }} />

            <Typography variant="body1">
              Drag & drop your CSV file here
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Supported format: .csv
            </Typography>

            <label>
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={(e) => upload(e.target.files[0])}
              />
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadFileIcon />}
                disabled={uploading}
              >
                Choose CSV File
              </Button>
            </label>

            {uploading && (
              <Box width="100%">
                <Typography variant="caption">Uploading {fileName}...</Typography>
                <LinearProgress sx={{ mt: 1 }} />
              </Box>
            )}

            {status === "success" && (
              <Stack alignItems="center" spacing={1}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                <Typography color="success.main">
                  Upload successful & embeddings generated
                </Typography>
              </Stack>
            )}

            {status === "error" && (
              <Stack alignItems="center" spacing={1}>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                <Typography color="error.main">
                  Upload failed. Please try again.
                </Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
