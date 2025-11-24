import React, { useState } from "react";
import ComponentBuilder from "./ComponentBuilder";
import WorkflowBuilder from "./WorkflowBuilder";

const WorkflowConfig = () => {
  const [activeTab, setActiveTab] = useState("components");

  // shared state
  const [componentLibrary, setComponentLibrary] = useState({
    primitive: [
      { id: "text", label: "Text Box", type: "text" },
      { id: "textarea", label: "Text Area", type: "textarea" },
      { id: "dropdown", label: "Dropdown", type: "dropdown", options: ["A", "B"] },
      { id: "date", label: "Date Picker", type: "date" },
      { id: "radio", label: "Radio Button", type: "radio", options: ["Yes", "No"] },
      { id: "file", label: "File Upload", type: "file" }
    ],
    composite: []
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Workflow Configuration</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("components")}>
          Create Components
        </button>
        <button onClick={() => setActiveTab("workflow")}>
          Create Workflow
        </button>
      </div>

      {/* Tab Panels */}
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
  );
};

export default WorkflowConfig;
