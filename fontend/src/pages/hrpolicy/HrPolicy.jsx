"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { HandbookAPI } from "../../api/handbookApi";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CompanyLogo from "../../assets/caerus-logo.png";
import { theme } from "../../theme/theme";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";

const HrPolicy = () => {
  const { user } = useAuth();
  const isAdminOrHR = ["ADMIN", "HR"].includes(user?.role);

  const [handbooks, setHandbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null); // will hold the doc being edited
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch all handbooks
  const fetchHandbooks = async () => {
    setLoading(true);
    try {
      const data = await HandbookAPI.getAllHandbooks();
      setHandbooks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandbooks();
  }, []);

  // File validation
  const validateFile = (file) => {
    if (!file) return "Please select a file";
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) return "Only PDF, DOC, or DOCX allowed";
    if (file.size > 1 * 1024 * 1024) return "File size must be ≤ 1MB";
    return "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const err = validateFile(file);
    if (err) {
      setError(err);
      setSelectedFile(null);
    } else {
      setError("");
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) return setError("Title is required");
    if (!selectedFile) return setError("Please select a file");

    setUploading(true);
    setError("");
    try {
      await HandbookAPI.uploadHandbook(title, selectedFile, user.id);
      setSuccess("Document uploaded successfully!");
      setTitle("");
      setSelectedFile(null);
      setOpenDialog(false);
      fetchHandbooks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDocId(id);
    setOpenDeleteDialog(true);
  };
  const handleEditClick = (doc) => {
    setEditingDoc(doc);
    setTitle(doc.title); // pre-fill title
    setSelectedFile(null); // optional: keep file null so user can choose to replace
    setOpenEditDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await HandbookAPI.deleteHandbook(deleteDocId);
      setSuccess("Document deleted");
      fetchHandbooks();
      setOpenDeleteDialog(false);
      setDeleteDocId(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete");
      setOpenDeleteDialog(false);
    }
  };
  const closeUploadDialog = () => {
    setOpenDialog(false);
    setOpenEditDialog(false);
    setTitle("");
    setSelectedFile(null);
    setEditingDoc(null);
    setError("");
  };

  const handleDownload = (contentUrl) => {
    window.open(HandbookAPI.getFileURL(contentUrl), "_blank");
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: theme.spacing.xl }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.lg,
            flexWrap: "wrap",
            gap: theme.spacing.md,
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "28px" : "32px",
              fontWeight: 700,
              color: theme.colors.text.primary,
              margin: 0,
            }}
          >
            HR Policy & Handbooks
          </h1>
        </div>

        <Box display="flex" justifyContent="center" alignItems="center">
          <Box textAlign="center" flex={1}>
            <img
              src={CompanyLogo}
              alt="Logo"
              style={{ height: 120, marginBottom: 6 }}
            />
          </Box>
        </Box>

        {/* Success/Error Alerts */}
        <Alert
          open={!!success}
          onClose={() => setSuccess("")}
          severity="success"
          message={success}
          autoHideDuration={3000}
        />

        <Alert
          open={!!error}
          onClose={() => setError("")}
          severity="error"
          message={error}
          autoHideDuration={4000}
        />

        {/* Documents List */}
        <Box mb={3} display="flex" justifyContent="flex-end">
          {isAdminOrHR && (
            <Button
              type="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              + Add New
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.md,
          }}
        >
          {loading ? (
            <Box p={4} textAlign="center">
              <CircularProgress />
            </Box>
          ) : handbooks.length === 0 ? (
            <Box
              p={6}
              textAlign="center"
              color="text.secondary"
              sx={{
                border: `1px solid ${theme.colors.lightGray}`,
                borderRadius: theme.borderRadius.large,
                bgcolor: theme.colors.background,
              }}
            >
              <Typography variant="h6">No documents available</Typography>
              {isAdminOrHR && (
                <Typography mt={1}>
                  Click "Add New" to upload the first document
                </Typography>
              )}
            </Box>
          ) : (
            handbooks.map((doc) => (
              <Box
                key={doc.id}
                sx={{
                  p: theme.spacing.lg,
                  borderRadius: theme.borderRadius.large,

                  bgcolor: theme.colors.surface,
                  boxShadow: theme.shadows.small,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  minHeight: 80,
                  transition: theme.transitions.medium,
                  marginBottom: theme.spacing.lg,
                  "&:hover": {
                    //boxShadow: theme.shadows.medium,
                    border: `1px solid ${theme.colors.primary}`,
                    borderColor: theme.colors.primary,
                  },
                }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  textAlign="left"
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: theme.colors.text.primary }}
                  >
                    {doc.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.colors.text.secondary, mt: 0.5 }}
                  >
                    Updated on {new Date(doc.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <IconButton
                    sx={{
                      color: theme.colors.primary,
                      "&:hover": {
                        bgcolor: `${theme.colors.primaryLight}20`,
                      },
                    }}
                    onClick={() => handleDownload(doc.contentUrl)}
                  >
                    <DownloadIcon />
                  </IconButton>

                  {isAdminOrHR && (
                    <>
                      <IconButton
                        sx={{
                          color: theme.colors.secondary,
                          "&:hover": {
                            bgcolor: `${theme.colors.secondary}20`,
                          },
                        }}
                        onClick={() => handleEditClick(doc)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        sx={{
                          color: theme.colors.error,
                          "&:hover": {
                            bgcolor: `${theme.colors.error}20`,
                          },
                        }}
                        onClick={() => handleDeleteClick(doc.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Stack>
              </Box>
            ))
          )}
        </Box>

        {/* Create New Dialog */}
        <Dialog
          open={openDialog || openEditDialog}
          onClose={() => !uploading && closeUploadDialog()}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: theme.borderRadius.large,
              boxShadow: theme.shadows.large,
              overflow: "hidden",
              bgcolor: theme.colors.surface,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: theme.colors.surface,
              borderBottom: `1px solid ${theme.colors.lightGray}`,
              py: 2,
              px: 3,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              color={theme.colors.text.primary}
            >
              {openEditDialog ? "Update Document" : "Upload New Document"}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pb: 2, px: { xs: 2, sm: 3 } }}>
            <TextField
              label="Document Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              disabled={uploading}
              sx={{
                mb: 3,
                "& .MuiInputBase-root": {
                  borderRadius: theme.borderRadius.medium,
                },
                "& .MuiInputLabel-root": {
                  color: theme.colors.text.secondary, // default label color
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: theme.colors.lightGray, // default border color
                  },
                  "&:hover fieldset": {
                    borderColor: theme.colors.primaryLight,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.colors.primary,
                  },
                  "&.Mui-focused .MuiInputLabel-root": {
                    color: theme.colors.primary, // label color on focus
                  },
                },
              }}
            />

            {/* Full Box File Input */}
            <Box
              component="label"
              htmlFor="file-upload-input"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
                p: 4,
                border: `2px dashed ${theme.colors.lightGray}`,
                borderRadius: theme.borderRadius.medium,
                bgcolor: theme.colors.gray,
                textAlign: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                transition: theme.transitions.fast,
                "&:hover": {
                  borderColor: theme.colors.primaryLight,
                  bgcolor: `${theme.colors.primaryLight}10`,
                },
              }}
            >
              <UploadFileIcon
                sx={{
                  fontSize: { xs: 40, sm: 48 },
                  color: openEditDialog
                    ? theme.colors.secondary
                    : theme.colors.primary,
                  mb: 1,
                }}
              />

              <Typography variant="body2" color={theme.colors.text.secondary}>
                {selectedFile
                  ? `Selected: ${selectedFile.name} (${(
                      selectedFile.size / 1024
                    ).toFixed(1)} KB)`
                  : "Click or drag file here to upload"}
              </Typography>

              <Typography
                variant="caption"
                color={theme.colors.secondary}
                sx={{ mt: 1 }}
              >
                Allowed: PDF, DOC, DOCX • Max: 1MB
              </Typography>

              <input
                id="file-upload-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              pt: 2,
              borderTop: `1px solid ${theme.colors.lightGray}`,
              justifyContent: "flex-end",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              type="secondary"
              onClick={closeUploadDialog}
              disabled={uploading}
              sx={{
                borderRadius: theme.borderRadius.medium,
                textTransform: "none",
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={
                uploading || !title.trim() || (!selectedFile && !openEditDialog)
              }
              startIcon={
                uploading ? <CircularProgress size={20} /> : <UploadFileIcon />
              }
              sx={{
                borderRadius: theme.borderRadius.medium,
                textTransform: "none",
              }}
            >
              {uploading ? "Saving..." : openEditDialog ? "Update" : "Upload"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              Confirm Delete
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: theme.colors.text.primary }}>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button type="secondary" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleConfirmDelete}
              sx={{ color: theme.colors.error }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default HrPolicy;
