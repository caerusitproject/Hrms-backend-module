import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  OutlinedInput,
  Grid,
  FormHelperText,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { Delete, AttachFile, MailOutline } from "@mui/icons-material";
import { EmailTemplateAPI } from "../../api/emailTemplateApi";
import { AllemployeeApi } from "../../api/getallemployeeApi";
import { theme as customTheme } from "../../theme/theme";
import Button from "../../components/common/Button";
import { EmailSendApi } from "../../api/emailSendApi";
import { Snackbar, Alert } from "@mui/material";
import SendIcon from "@mui/icons-material/Send"; // email send icon
import { keyframes } from "@emotion/react";
import { theme } from "../../theme/theme";

const SendMailPage = () => {
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [errors, setErrors] = useState({
    to: false,
    templateId: false,
  });
  const [mailForm, setMailForm] = useState({
    to: "",
    cc: [],
    bcc: [],
    templateId: "",
    subject: "",
    body: "",
    variables: {},
    attachments: [],
  });
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewBody, setPreviewBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

  const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;


  // Fetch Employees
  useEffect(() => {
    (async () => {
      try {
        const res = await AllemployeeApi.getEmployeesByRole();
        setEmployees(res?.data?.employeeList || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    })();
  }, []);

  // Fetch Email Templates
  useEffect(() => {
    (async () => {
      try {
        const res = await EmailTemplateAPI.getAllTemplates();
        setTemplates(res?.templates?.rows || []);
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    })();
  }, []);

  // Extract variables from template's allowedVariables
  const extractVariables = (template) => {
    const allVars = template.allowedVariables || [];
    if (allVars.length === 0) {
      // Fallback to extraction if no allowedVariables
      const matches = [
        ...new Set([
          ...Array.from(template.body.matchAll(/{{(.*?)}}/g)).map((m) =>
            m[1].trim()
          ),
          ...Array.from(template.subject.matchAll(/{{(.*?)}}/g)).map((m) =>
            m[1].trim()
          ),
        ]),
      ];
      allVars.push(...matches);
    }
    const vars = {};
    allVars.forEach((v) => (vars[v] = ""));
    return vars;
  };

  // Update template selection
  useEffect(() => {
    if (!mailForm.templateId) {
      setPreviewSubject("");
      setPreviewBody("");
      setMailForm((prev) => ({
        ...prev,
        subject: "",
        body: "",
        variables: {},
      }));
      setErrors((prev) => ({ ...prev, templateId: false }));
      return;
    }
    const template = templates.find((t) => t.id === mailForm.templateId);
    if (template) {
      setMailForm((prev) => ({
        ...prev,
        subject: template.subject,
        body: template.body,
        variables: extractVariables(template),
      }));
      setErrors((prev) => ({ ...prev, templateId: false }));
    }
  }, [mailForm.templateId, templates]);

  // Auto-fill variables from selected employee
  useEffect(() => {
    if (!mailForm.to || Object.keys(mailForm.variables).length === 0) return;
    const emp = employees.find((e) => e.email === mailForm.to);
    if (emp) {
      setMailForm((prev) => {
        const newVars = { ...prev.variables };
        Object.keys(newVars).forEach((key) => {
          if (emp[key] !== undefined && emp[key] !== "") {
            newVars[key] = emp[key];
          }
        });
        // Auto-set date if present and empty
        if (
          newVars.date &&
          (newVars.date === "" || newVars.date === undefined)
        ) {
          newVars.date = new Date().toLocaleDateString();
        }
        // Auto-set email if present and empty
        if (
          newVars.email &&
          (newVars.email === "" || newVars.email === undefined)
        ) {
          newVars.email = emp.email;
        }
        // Auto-set company if needed (static or from emp if available)
        if (
          newVars.company &&
          (newVars.company === "" || newVars.company === undefined)
        ) {
          newVars.company = "ABC Company"; // Assuming a default company name
        }
        return {
          ...prev,
          variables: newVars,
        };
      });
    }
  }, [mailForm.to, employees, mailForm.variables]);

  // Update preview when variables change
  useEffect(() => {
    if (!mailForm.templateId) return;
    const template = templates.find((t) => t.id === mailForm.templateId);
    if (template && Object.keys(mailForm.variables).length > 0) {
      const updatedSubject = replaceVariables(
        template.subject,
        mailForm.variables
      );
      const updatedBody = replaceVariables(template.body, mailForm.variables);
      setPreviewSubject(updatedSubject);
      setPreviewBody(updatedBody);
    }
  }, [mailForm.variables, mailForm.templateId, templates]);

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const replaceVariables = (text, variables) => {
    let updated = text;
    Object.keys(variables).forEach((key) => {
      const value = variables[key];
      if (value !== undefined && value !== "") {
        const placeholder = `{{${key}}}`;
        const replacement = value;
        updated = updated.replace(
          new RegExp(escapeRegExp(placeholder), "g"),
          replacement
        );
      }
    });
    return updated;
  };


  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files).filter(
      (file) => file.name.trim() !== ""
    );

    // 🔹 1. Check file count
    if (uploadedFiles.length > 1) {
      setToast({
        open: true,
        message: "Please upload only one file",
        severity: "error",
      });
      e.target.value = null;
      return; // stop here
    }

    const file = uploadedFiles[0]; // only file available now

    // 🔹 2. Validate file size
    if (file && file.size > 20 * 1024) {
      setToast({
        open: true,
        message: `"${file.name}" exceeds 20KB size limit`,
        severity: "error",
      });
      e.target.value = null;
      return; // stop here
    }

    // 🔹 3. Safe: File is valid → add to attachments
    setMailForm((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), file],
    }));

    e.target.value = null; // reset input so selecting same file works again
  };


  // Remove file
  const handleDeleteFile = (idx) => {
    setMailForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      to: !mailForm.to,
      templateId: !mailForm.templateId,
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  // Send Mail
  const handleSendMail = async () => {
    if (!validateForm()) {
      setToast({
        open: true,
        message: "Please fill in all mandatory fields: To and Mail Type.",
        severity: "error",
      });
      return;
    }

    if (!mailForm.subject.trim()) {
      setToast({
        open: true,
        message: "Subject is mandatory. Please select a valid template.",
        severity: "error",
      });
      setErrors((prev) => ({ ...prev, templateId: true }));
      return;
    }

    setLoading(true);

    const template = templates.find((t) => t.id === mailForm.templateId);
    const finalSubject = replaceVariables(template.subject, mailForm.variables);
    const finalBody = replaceVariables(template.body, mailForm.variables);

    // Convert attachments to base64 (skip if filename is empty)
    const attachments = [];
    if (mailForm.attachments && mailForm.attachments.length > 0) {
      for (const file of mailForm.attachments) {
        if (file.name.trim() === "") {
          console.warn("Skipping attachment with empty filename:", file);
          continue;
        }
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(file);
        });
        attachments.push({
          filename: file.name,
          content: base64,
          contentType: file.type || "application/octet-stream",
          size: file.size,
        });
      }
    }

    const payload = {
      to: mailForm.to,
      cc: mailForm.cc,
      bcc: mailForm.bcc,
      subject: finalSubject,
      body: finalBody,
      isHtml: true,
      variables: mailForm.variables,
      attachments,
      templateId: template?.id,
      templateType: template?.type,
    };

    try {
      //console.log("📤 Sending Email Payload:", payload);
      const response = await EmailSendApi.sendEmail(payload);
      await new Promise((r) => setTimeout(r, 800));

      // ✅ Show success toast
      setToast({
        open: true,
        message: "Mail sent successfully!",
        severity: "success",
      });
      setMailForm({
        to: "",
        cc: [],
        bcc: [],
        templateId: "",
        subject: "",
        body: "",
        variables: {},
        attachments: [],
      });

      // ✅ Reset preview as well
      setPreviewSubject("");
      setPreviewBody("");
      setErrors({
        to: false,
        templateId: false,
      });
    } catch (err) {
      console.error("Error sending email:", err);
      setToast({
        open: true,
        message: "Failed to send mail. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get employee label
  const getEmployeeLabel = (email) => {
    const emp = employees.find((e) => e.email === email);
    return emp ? `${emp.name} (${emp.empCode})` : email;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: customTheme.colors.background,
          p: 3,
        }}
      >
        {/* Animated Email Icon */}
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <SendIcon
            sx={{
              fontSize: 48,
              color: customTheme.colors.primary,
              animation: `${bounce} 1s infinite`,
            }}
          />
          <CircularProgress
            size={64}
            thickness={4}
            sx={{
              position: "absolute",
              color: customTheme.colors.primary,
              opacity: 0.3,
              animation: `${rotate} 2s linear infinite`,
            }}
          />
        </Box>

        {/* Text */}
        <Typography
          variant="h6"
          sx={{
            color: customTheme.colors.text.primary,
            fontWeight: 500,
          }}
        >
          Sending Mail...
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: customTheme.colors.text.secondary,
            mt: 0.5,
          }}
        >
          Please wait while we process your email
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "100vh" }}>
        <div>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: customTheme.colors.text.primary }}
            >
              Email Process
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* To + Template Select */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" error={errors.to} required>
                <InputLabel>To</InputLabel>
                <Select
                  value={mailForm.to}
                  onChange={(e) => {
                    setMailForm((prev) => ({ ...prev, to: e.target.value }));
                    if (errors.to)
                      setErrors((prev) => ({ ...prev, to: false }));
                  }}
                  label="To *"
                  inputProps={{
                    sx: {
                      borderRadius: 1.5,
                      "&.MuiOutlinedInput-notchedOutline": {
                        borderRadius: 1.5,
                      }
                    }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme?.colors?.primary,
                    }
                  }}
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.email}>
                      {`${emp.name} (${emp.empCode})`}
                    </MenuItem>
                  ))}
                </Select>
                {!errors.to && !mailForm.to && (<FormHelperText>Please select this feild </FormHelperText>)}
                {errors.to && (
                  <FormHelperText error>This field is required.</FormHelperText>
                )}

              </FormControl>

            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                size="small"
                error={errors.templateId}
                required
                disabled={!mailForm.to}
              >
                <InputLabel>Select Mail Type</InputLabel>
                <Select
                  value={mailForm.templateId}
                  onChange={(e) => {
                    setMailForm((prev) => ({
                      ...prev,
                      templateId: e.target.value,
                    }));
                    if (errors.templateId)
                      setErrors((prev) => ({ ...prev, templateId: false }));
                  }}
                  label="Select Mail Type *"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme?.colors?.primary,
                    }
                  }}

                >
                  {templates.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.templateId && (
                  <FormHelperText error>This field is required.</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* CC & BCC with Chips */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>CC</InputLabel>
                <Select
                  multiple
                  value={mailForm.cc}
                  onChange={(e) =>
                    setMailForm((prev) => ({ ...prev, cc: e.target.value }))
                  }
                  input={<OutlinedInput label="CC" sx={{
                    borderRadius: customTheme.borderRadius.small,
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: customTheme.colors.primary,
                    },
                  }} />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((email) => (
                        <Chip
                          key={email}
                          label={getEmployeeLabel(email)}
                          size="small"
                          sx={{
                            backgroundColor: `${customTheme.colors.primaryLight}34`,
                            color: customTheme.colors.primaryDark,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.email}>
                      {`${emp.name} (${emp.empCode})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>BCC</InputLabel>
                <Select
                  multiple
                  value={mailForm.bcc}
                  onChange={(e) =>
                    setMailForm((prev) => ({ ...prev, bcc: e.target.value }))
                  }
                  input={<OutlinedInput label="BCC" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((email) => (
                        <Chip
                          key={email}
                          label={getEmployeeLabel(email)}
                          size="small"
                          sx={{
                            backgroundColor: `${customTheme.colors.primaryLight}34`,
                            color: customTheme.colors.primaryDark,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.email}>
                      {`${emp.name} (${emp.empCode})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Attachments Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: customTheme.borderRadius.medium,
                  backgroundColor: customTheme.colors.surface,
                  boxShadow: customTheme.shadows.small,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AttachFile
                    sx={{ mr: 1, color: customTheme.colors.primary }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight={500}
                    sx={{ color: customTheme.colors.text.primary }}
                  >
                    Attachments
                  </Typography>
                </Box>
                <Button
                  type="secondary"
                  startIcon={<AttachFile />}
                  onClick={() =>
                    document.getElementById("attachmentInput").click()
                  }
                  sx={{
                    borderColor: customTheme.colors.primary,
                    color: customTheme.colors.primary,
                    textTransform: "none",
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  Upload Files
                </Button>
                <input
                  id="attachmentInput"
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileUpload}
                />
                {mailForm.attachments.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {mailForm.attachments.map((file, idx) => (
                      <Chip
                        key={idx}
                        label={file.name || "Unnamed File"}
                        onDelete={() => handleDeleteFile(idx)}
                        deleteIcon={<Delete />}
                        sx={{
                          backgroundColor: `${customTheme.colors.primaryLight}34`,
                          marginTop: "8px",
                          color: customTheme.colors.primaryDark,
                          "& .MuiChip-deleteIcon": {
                            color: customTheme.colors.error,
                          },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Mail Preview */}
            {mailForm.templateId && (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: customTheme.colors.background,
                    borderRadius: customTheme.borderRadius.medium,
                    boxShadow: customTheme.shadows.medium,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    mb={2}
                    sx={{ color: customTheme.colors.text.primary }}
                  >
                    Email Preview
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 500,
                        color: customTheme.colors.text.secondary,
                      }}
                      component="span"
                    >
                      <strong>Subject:</strong>{" "}
                    </Typography>
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{ color: customTheme.colors.text.primary }}
                    >
                      {previewSubject || mailForm.subject}
                    </Typography>
                  </Box>
                  <Paper
                    sx={{
                      p: 3,
                      backgroundColor: customTheme.colors.surface,
                      border: `1px solid ${customTheme.colors.lightGray}`,
                      borderRadius: customTheme.borderRadius.small,
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: previewBody || mailForm.body,
                      }}
                    />
                  </Paper>
                </Paper>
              </Grid>
            )}

            {/* Send Mail Button */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSendMail}
                  disabled={loading || !mailForm.to || !mailForm.templateId}
                  sx={{
                    backgroundColor: customTheme.colors.primary,
                    textTransform: "none",
                    fontWeight: 500,
                    padding: "12px 24px",
                    borderRadius: customTheme.borderRadius.medium,
                    boxShadow: customTheme.shadows.small,
                    "&:hover": {
                      boxShadow: customTheme.shadows.medium,
                    },
                    "&:disabled": {
                      backgroundColor: customTheme.colors.disabled,
                      color: customTheme.colors.text.disabled,
                    },
                  }}
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      Send  Mail
                      <SendIcon
                        fontSize="small"
                        sx={{ ml: 0.5, verticalAlign: "middle" }}
                      />
                    </>
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </div>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{
            width: "100%",
            fontWeight: 500,
            backgroundColor:
              toast.severity === "success"
                ? customTheme.colors.success
                : customTheme.colors.error,
            color: "#fff",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SendMailPage;
