import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Chip,
} from "@mui/material";
import { Edit, Visibility, Send, Delete } from "@mui/icons-material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { theme as customTheme } from "../../theme/theme";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { EmailTemplateAPI } from "../../api/emailTemplateApi";

// Predefined variables
const predefinedVariables = [
  { key: "name", label: "{{name}}" },
  { key: "empCode", label: "{{empCode}}" },
  { key: "email", label: "{{email}}" },
  { key: "designation", label: "{{designation}}" },
  { key: "company", label: "{{company}}" },
  { key: "date", label: "{{date}}" },
  // { key: "idNumber", label: "{{idNumber}}" },
  { key: "idNumber", label: "{{idNumber}}" },
];

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendMailOpen, setSendMailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: null,
    type: "",
    subject: "",
    body: "",
  });
  const [formData, setFormData] = useState({
    id: null,
    type: "",
    subject: "",
    body: "",
    allowedVariables: [],
  });
  const [mailForm, setMailForm] = useState({
    to: "",
    variables: {},
  });
  const [previewBody, setPreviewBody] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const subjectRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [focusedField, setFocusedField] = useState("body"); // Track focused field
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || "USER"; // default to USER if undefined

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await EmailTemplateAPI.getAllTemplates();
      const rows = data?.templates?.rows;
      setTemplates(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([]); // <-- prevent undefined
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Update preview when mailForm.variables change
  useEffect(() => {
    console.log("Updating preview with variables:", mailForm.variables);
    console.log("Selected Template:", selectedTemplate);
    if (selectedTemplate?.body && selectedTemplate?.subject) {
      let updatedBody = (selectedTemplate?.body || "").replace(/\n/g, "<br />");
      let updatedSubject = selectedTemplate?.subject || "";
      Object.keys(mailForm.variables).forEach((key) => {
        const placeholder = `{{${key}}}`;
        const replacement = mailForm.variables[key] || placeholder;
        updatedBody = updatedBody.replace(
          new RegExp(placeholder, "g"),
          replacement
        );
        updatedSubject = updatedSubject.replace(
          new RegExp(placeholder, "g"),
          replacement
        );
      });
      setPreviewBody(updatedBody);
      setPreviewSubject(updatedSubject);
    }
  }, [mailForm.variables, selectedTemplate]);

  const extractVariables = (text) => {
    const matches = [...text.matchAll(/{{(.*?)}}/g)].map((m) => m[1].trim());
    return [...new Set(matches)]; // unique
  };

  const handleOpen = (template = null) => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        id: null,
        type: "",
        subject: "",
        body: "",
        allowedVariables: [],
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    const allVars = [
      ...new Set([
        ...extractVariables(formData.subject),
        ...extractVariables(formData.body),
      ]),
    ];
    const payload = {
      type: formData.type,
      subject: formData.subject,
      body: formData.body,
      allowedVariables: allVars,
      isHtml: true,
    };
    try {
      if (formData.id) {
        await EmailTemplateAPI.updateTemplate(formData.id, payload);
      } else {
        await EmailTemplateAPI.createTemplate(payload);
      }
      fetchTemplates();
      setOpen(false);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTemplateId) {
      try {
        await EmailTemplateAPI.deleteTemplate(deleteTemplateId);
        fetchTemplates();
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
    setDeleteConfirmOpen(false);
    setDeleteTemplateId(null);
  };

  const handleDelete = (id) => {
    setDeleteTemplateId(id);
    setDeleteConfirmOpen(true);
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleSendMail = (template) => {
    // Fixed: Always extract variables from subject and body for consistency, falling back to allowedVariables if empty
    let allVars = template.allowedVariables || [];
    if (allVars.length === 0) {
      allVars = [
        ...new Set([
          ...extractVariables(template.subject),
          ...extractVariables(template.body),
        ]),
      ];
    }
    const variables = {};
    allVars.forEach((v) => (variables[v] = ""));

    setMailForm({ to: "", variables });
    setSelectedTemplate(template);
    setPreviewBody(template.body.replace(/\n/g, "<br />"));
    setPreviewSubject(template.subject);
    setSendMailOpen(true);
  };

  const handleMailSubmit = async () => {
    // Replace variables in subject and body with actual values
    let finalSubject = selectedTemplate.subject;
    let finalBody = selectedTemplate.body;

    Object.keys(mailForm.variables).forEach((key) => {
      const placeholder = `{{${key}}}`;
      const replacement = mailForm.variables[key] || placeholder;
      finalSubject = finalSubject.replace(
        new RegExp(placeholder, "g"),
        replacement
      );
      finalBody = finalBody.replace(new RegExp(placeholder, "g"), replacement);
    });

    // Prepare attachments for upload (convert File objects to base64 or FormData)
    const attachments = [];
    if (mailForm.attachments && mailForm.attachments.length > 0) {
      for (const file of mailForm.attachments) {
        // Option 1: Convert to base64
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(",")[1]); // Remove data:mime;base64, prefix
          reader.readAsDataURL(file);
        });

        attachments.push({
          filename: file.name,
          content: base64,
          contentType: file.type,
          size: file.size,
        });
      }
    }

    // Create the final payload
    const payload = {
      to: mailForm.to,
      subject: finalSubject,
      body: finalBody,
      isHtml: true,
      variables: mailForm.variables, // Keep original variables for reference
      attachments: attachments,
      templateId: selectedTemplate.id,
      templateType: selectedTemplate.type,
    };

    console.log("Sending Mail Payload:", payload);

    try {
      // TODO: Replace with your actual API call
      // const response = await EmailTemplateAPI.sendEmail(payload);
      // alert("Email sent successfully!");

      // alert("Email payload ready! Check console for details.");
      setSendMailOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    }
  };

  // Combined insert function that works for both subject and body
  const insertVariable = (variable) => {
    if (focusedField === "subject") {
      const input = subjectRef.current;
      if (input) {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const value = formData.subject;
        const newValue =
          value.substring(0, start) + variable + value.substring(end);

        setFormData({ ...formData, subject: newValue });

        requestAnimationFrame(() => {
          const newPosition = start + variable.length;
          input.focus();
          input.setSelectionRange(newPosition, newPosition);
        });
      }
    } else if (focusedField === "body" && editorInstance) {
      editorInstance.model.change((writer) => {
        const selection = editorInstance.model.document.selection;
        if (selection.isCollapsed) {
          writer.insertText(variable, selection.anchor);
        } else {
          const range = selection.getFirstRange();
          writer.remove(range);
          writer.insertText(variable, range.start);
        }
      });
      editorInstance.editing.view.focus();
    }
  };

  const renderVariablesBox = () => (
    <Paper
      sx={{
        p: 2,
        mt: 2,
        mb: 2,
        borderRadius: customTheme.borderRadius.medium,
        background: customTheme.colors.background,
        border: `1px solid ${customTheme.colors.lightGray}`,
      }}
      elevation={0}
    >
      <Typography variant="subtitle2" gutterBottom fontWeight={500}>
        Predefined Variables
      </Typography>
      <Grid container spacing={1}>
        {predefinedVariables.map((varItem) => (
          <Grid item key={varItem.key}>
            <Chip
              label={varItem.label}
              size="small"
              onClick={() => insertVariable(varItem.label)}
              clickable
              sx={{
                cursor: "pointer",
                backgroundColor: `${customTheme.colors.primaryLight}34`,
                color: customTheme.colors.primaryDark,
                "&:hover": {
                  backgroundColor: customTheme.colors.gray,
                },
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  return (
    <div>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "space-between" },
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <h1
          style={{
            fontSize: window.innerWidth < 640 ? "24px" : "32px",
            fontWeight: 700,
            color: customTheme.colors.text.primary,
            margin: 0,
            flex: 1,
          }}
        >
          Email Templates
        </h1>

        {userRole === "ADMIN" && (
          <Button
            variant="contained"
            onClick={() => handleOpen()}
            sx={{
              backgroundColor: customTheme.colors.primary,
              textTransform: "none",
              borderRadius: customTheme.borderRadius.medium,
              padding: "10px 20px",
              fontWeight: 500,
              boxShadow: customTheme.shadows.small,
              "&:hover": {
                boxShadow: customTheme.shadows.medium,
              },
            }}
          >
            + New Template
          </Button>
        )}
      </Box>

      {/* Template Table */}
      <Paper
        sx={{
          overflowX: "auto",
          borderRadius: customTheme.borderRadius.large,
          boxShadow: customTheme.shadows.medium,
          backgroundColor: customTheme.colors.surface,
        }}
      >
        <Table sx={{ minWidth: 300 }} aria-label="email templates">
          <TableHead>
            <TableRow sx={{ backgroundColor: customTheme.colors.gray }}>
              <TableCell>
                <b>Type</b>
              </TableCell>
              {!isMobile && (
                <TableCell>
                  <b>Subject</b>
                </TableCell>
              )}
              <TableCell
                align="right"
                sx={{
                  textAlign: { xs: "center", sm: "right" },
                }}
              >
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(templates || []).map((template) => (
              <TableRow
                key={template.id}
                sx={{
                  "&:hover": { backgroundColor: customTheme.colors.gray },
                  transition: customTheme.transitions.fast,
                }}
              >
                <TableCell
                  sx={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {template.type}
                </TableCell>
                {!isMobile && (
                  <TableCell
                    sx={{
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {template.subject}
                  </TableCell>
                )}
                <TableCell align="right">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 0.25,
                    }}
                  >
                    <IconButton
                      sx={{ mr: 0 }}
                      onClick={() => handlePreview(template)}
                      size="small"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    {userRole === "ADMIN" && (
                      <IconButton
                        sx={{ mr: 0 }}
                        onClick={() => handleOpen(template)}
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                    {/* <IconButton
                      sx={{ color: customTheme.colors.primary }}
                      onClick={() => handleSendMail(template)}
                      size="small"
                    >
                      <Send fontSize="small" />
                    </IconButton> */}
                    {userRole === "ADMIN" && (
                      <IconButton
                        sx={{ mr: 0, color: customTheme.colors.error }}
                        onClick={() => handleDelete(template.id)}
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Create/Edit Template Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 2, pt: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {formData.id ? "Edit Template" : "Create New Template"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Email Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            margin="normal"
            variant="outlined"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: customTheme.borderRadius.small,
                fontSize: isMobile ? "14px" : "16px",
                padding: isMobile ? "10px" : "12px",
                "&.Mui-focused fieldset": {
                  borderColor: customTheme.colors.primary,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: customTheme.colors.primary,
              },
            }}
          />
          <TextField
            inputRef={subjectRef}
            fullWidth
            label="Subject"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            onFocus={() => setFocusedField("subject")}
            margin="normal"
            variant="outlined"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: customTheme.borderRadius.small,
                fontSize: isMobile ? "14px" : "16px",
                padding: isMobile ? "10px" : "12px",
                "&.Mui-focused fieldset": {
                  borderColor: customTheme.colors.primary,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: customTheme.colors.primary,
              },
            }}
          />
          {renderVariablesBox()}
          <Typography variant="subtitle1" mt={2} mb={1} fontWeight={500}>
            Body
          </Typography>
          <Box
            sx={{
              border: `1px solid ${customTheme.colors.lightGray}`,
              borderRadius: customTheme.borderRadius.small,
              minHeight: "200px",
            }}
          >
            <CKEditor
              editor={ClassicEditor}
              data={formData.body}
              onChange={(event, editor) => {
                const data = editor.getData();
                setFormData({ ...formData, body: data });
              }}
              onReady={(editor) => {
                setEditorInstance(editor);
                // Set focus listener on editor
                editor.editing.view.document.on("focus", () => {
                  setFocusedField("body");
                });
              }}
              config={{
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "|",
                  "outdent",
                  "indent",
                  "|",
                  "blockQuote",
                  "insertTable",
                  "mediaEmbed",
                  "undo",
                  "redo",
                ],
                height: 200,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} type="secondary">
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ ml: 2, backgroundColor: customTheme.colors.primary }}
            onClick={handleSave}
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 2 }}>Template Preview</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedTemplate ? (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                <strong>Subject:</strong> {selectedTemplate.subject}
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: customTheme.borderRadius.medium,
                  background: customTheme.colors.background,
                  border: `1px solid ${customTheme.colors.lightGray}`,
                }}
                elevation={0}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedTemplate.body.replace(/\n/g, "<br />"),
                  }}
                />
              </Paper>
            </Box>
          ) : (
            <Typography sx={{ color: customTheme.colors.text.secondary }}>
              No template selected
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setPreviewOpen(false)}
            variant="contained"
            sx={{ backgroundColor: customTheme.colors.primary }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Mail Form Dialog */}
      <Dialog
        open={sendMailOpen}
        onClose={() => setSendMailOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 2, fontWeight: 700 }}>Send Email</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="To Email"
            value={mailForm.to}
            onChange={(e) => setMailForm({ ...mailForm, to: e.target.value })}
            margin="normal"
            variant="outlined"
            type="email"
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" mt={2} mb={1} fontWeight={500}>
            Template Variables
          </Typography>

          <Grid container spacing={2} mt={1}>
            {Object.keys(mailForm.variables).length > 0 ? (
              Object.keys(mailForm.variables).map((v) => (
                <Grid item xs={12} sm={6} key={v}>
                  <TextField
                    fullWidth
                    label={v.charAt(0).toUpperCase() + v.slice(1)}
                    value={mailForm.variables[v]}
                    onChange={(e) =>
                      setMailForm({
                        ...mailForm,
                        variables: {
                          ...mailForm.variables,
                          [v]: e.target.value,
                        },
                      })
                    }
                    variant="outlined"
                  />
                </Grid>
              ))
            ) : (
              <Typography
                sx={{ color: customTheme.colors.text.secondary, ml: 1, mt: 1 }}
              >
                No variables found in this template.
              </Typography>
            )}
          </Grid>

          {/* Attachments Section */}
          <Typography variant="subtitle1" mt={3} mb={1} fontWeight={500}>
            Attachments
          </Typography>

          <Button
            type="secondary"
            onClick={() => document.getElementById("attachmentInput").click()}
            sx={{
              borderColor: customTheme.colors.primary,
              color: customTheme.colors.primary,
              textTransform: "none",
              fontWeight: 500,
              mb: 2,
            }}
          >
            Upload Files
          </Button>

          <input
            id="attachmentInput"
            type="file"
            hidden
            multiple
            onChange={(e) => {
              const uploadedFiles = Array.from(e.target.files);
              setMailForm((prev) => ({
                ...prev,
                attachments: [...(prev.attachments || []), ...uploadedFiles],
              }));
              e.target.value = null; // reset input
            }}
          />

          {mailForm.attachments?.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mt: 1,
              }}
            >
              {mailForm.attachments.map((file, idx) => (
                <Chip
                  key={idx}
                  label={file.name}
                  onDelete={() =>
                    setMailForm((prev) => ({
                      ...prev,
                      attachments: prev.attachments.filter((_, i) => i !== idx),
                    }))
                  }
                  sx={{
                    backgroundColor: `${customTheme.colors.primaryLight}34`,
                    color: customTheme.colors.primaryDark,
                    "& .MuiChip-deleteIcon": {
                      color: customTheme.colors.error,
                    },
                  }}
                />
              ))}
            </Box>
          )}

          <Typography variant="subtitle1" mt={3} mb={1} fontWeight={700}>
            Email Preview
          </Typography>
          <Paper
            sx={{
              p: 2,
              mb: 2,
              borderRadius: customTheme.borderRadius.medium,
              background: customTheme.colors.background,
              border: `1px solid ${customTheme.colors.lightGray}`,
            }}
            elevation={0}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              <strong>Subject:</strong> {previewSubject}
            </Typography>
          </Paper>

          <Paper
            sx={{
              p: 2,
              borderRadius: customTheme.borderRadius.medium,
              background: customTheme.colors.background,
              maxHeight: "300px",
              overflowY: "auto",
              border: `1px solid ${customTheme.colors.lightGray}`,
            }}
            elevation={0}
          >
            <div dangerouslySetInnerHTML={{ __html: previewBody }} />
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSendMailOpen(false)} type="secondary">
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ ml: 2, backgroundColor: customTheme.colors.success }}
            onClick={handleMailSubmit}
            disabled={!mailForm.to.trim()}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTemplateId(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this template? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setDeleteTemplateId(null);
            }}
            type="secondary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: customTheme.colors.error }}
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
