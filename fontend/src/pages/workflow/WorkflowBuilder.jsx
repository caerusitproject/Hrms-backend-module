import React, { useState } from "react";
import { theme } from "../../theme/theme";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

export default function WorkflowBuilder({ componentLibrary }) {
  const [workflow, setWorkflow] = useState([]);
  const [stepName, setStepName] = useState("");
  const [selectedComponents, setSelectedComponents] = useState([]);

  const addComponent = (c) => setSelectedComponents([...selectedComponents, c]);

  const saveStep = () => {
    if (!stepName.trim()) return alert("Step name required");
    setWorkflow([...workflow, { stepName, components: selectedComponents }]);
    setStepName("");
    setSelectedComponents([]);
  };

  return (
    <div>
      <TextField
        fullWidth
        label="Step Name"
        value={stepName}
        onChange={(e) => setStepName(e.target.value)}
        sx={{ mb: 3 }}
      />

      <div style={{ marginBottom: theme.spacing.xl }}>
        <strong>Primitive Components:</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", mt: 1 }}>
          {componentLibrary.primitive.map((c) => (
            <Button key={c.id} variant="outlined" size="small" onClick={() => addComponent(c)}>
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: theme.spacing.xl }}>
        <strong>Composite Components:</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", mt: 1 }}>
          {componentLibrary.composite.map((c) => (
            <Button key={c.id} variant="contained" size="small" color="primary" onClick={() => addComponent(c)}>
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: theme.spacing.xl }}>
        <strong>Current Step Preview:</strong>
        <List dense>
          {selectedComponents.map((c, i) => (
            <ListItem key={i}><ListItemText primary={c.label} /></ListItem>
          ))}
        </List>
      </div>

      <Button variant="contained" color="secondary" size="large" onClick={saveStep}>
        Save Step to Workflow
      </Button>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>Final Workflow JSON</Typography>
      <pre style={{ background: "#f9f9f9", padding: 16, borderRadius: 8, fontSize: "13px" }}>
        {JSON.stringify(workflow, null, 2)}
      </pre>
    </div>
  );
}