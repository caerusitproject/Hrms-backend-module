import React, { useState } from "react";
import { theme } from "../../theme/theme";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

export default function ComponentBuilder({ componentLibrary, setComponentLibrary }) {
  const [compName, setCompName] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);

  const addField = (field) => setSelectedFields([...selectedFields, field]);

  const saveComposite = () => {
    if (!compName.trim()) return alert("Component name required");
    const id = compName.toLowerCase().replace(/\s/g, "");
    if (componentLibrary.composite.some(c => c.id === id)) return alert("Already exists!");

    setComponentLibrary({
      ...componentLibrary,
      composite: [...componentLibrary.composite, { id, label: compName, fields: selectedFields }]
    });
    setCompName("");
    setSelectedFields([]);
  };

  return (
    <div>
      <TextField
        fullWidth
        label="Composite Component Name"
        value={compName}
        onChange={(e) => setCompName(e.target.value)}
        sx={{ mb: 3 }}
      />

      <div style={{ marginBottom: theme.spacing.xl }}>
        <strong style={{ color: theme.colors.text.primary }}>Add Fields:</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
          {componentLibrary.primitive.map((p) => (
            <Button key={p.id} variant="outlined" size="small" onClick={() => addField(p)}>
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: theme.spacing.xl }}>
        <strong>Preview:</strong>
        <List dense>
          {selectedFields.map((f, i) => (
            <ListItem key={i}><ListItemText primary={f.label} /></ListItem>
          ))}
        </List>
      </div>

      <Button variant="contained" color="secondary" size="large" onClick={saveComposite}>
        Save Composite Component
      </Button>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>Existing Composites</Typography>
      <pre style={{ background: "#f9f9f9", padding: 16, borderRadius: 8, fontSize: "13px" }}>
        {JSON.stringify(componentLibrary.composite, null, 2)}
      </pre>
    </div>
  );
}