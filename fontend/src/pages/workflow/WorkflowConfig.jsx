"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../../theme/theme"; // Keep your existing theme
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

// Import your builders (or inline them below for simplicity)
import ComponentBuilder from "./ComponentBuilder";
import WorkflowBuilder from "./WorkflowBuilder";

const WorkflowConfigPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("components");

  const [componentLibrary, setComponentLibrary] = useState({
    primitive: [
      { id: "text", label: "Text Box", type: "text" },
      { id: "textarea", label: "Text Area", type: "textarea" },
      { id: "dropdown", label: "Dropdown", type: "dropdown", options: ["Option A", "Option B"] },
      { id: "date", label: "Date Picker", type: "date" },
      { id: "radio", label: "Radio Button", type: "radio", options: ["Yes", "No"] },
      { id: "file", label: "File Upload", type: "file" },
    ],
    composite: [],
  });

  return (
    <div>
      {/* Back Button + Header */}
      <div style={{ textAlign: "center", marginBottom: theme.spacing.xxl }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            position: "absolute",
            left: 20,
            top: 20,
            color: theme.colors.text.secondary,
          }}
        >
          Back
        </Button>

        <h1
          style={{
            color: theme.colors.text.primary,
            fontSize: window.innerWidth < 768 ? "32px" : "48px",
            fontWeight: "800",
            marginBottom: theme.spacing.md,
          }}
        >
          Workflow Builder
        </h1>
        <p
          style={{
            color: theme.colors.text.secondary,
            fontSize: window.innerWidth < 768 ? "15px" : "18px",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          Design reusable form components and build multi-step workflows with drag-and-drop ease.
        </p>
      </div>

      {/* Main Card - Same as Home.jsx */}
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.borderRadius.large,
          padding: window.innerWidth < 768 ? theme.spacing.xl : "50px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          border: `1px solid ${theme.colors.border}`,
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Custom MUI Tabs Styled Like Your Design */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            centered
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label="Create Components"
              value="components"
              sx={{ fontWeight: 600, fontSize: "16px" }}
            />
            <Tab
              label="Build Workflow"
              value="workflow"
              sx={{ fontWeight: 600, fontSize: "16px" }}
            />
          </Tabs>
        </Box>

        {/* Content */}
        {activeTab === "components" && (
          <ComponentBuilder
            componentLibrary={componentLibrary}
            setComponentLibrary={setComponentLibrary}
          />
        )}

        {activeTab === "workflow" && (
          <WorkflowBuilder componentLibrary={componentLibrary} />
        )}
      </div>
    </div>
  );
};

export default WorkflowConfigPage;