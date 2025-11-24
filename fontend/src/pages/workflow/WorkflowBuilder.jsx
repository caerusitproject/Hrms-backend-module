import React, { useState } from "react";

const WorkflowBuilder = ({ componentLibrary }) => {
  const [workflow, setWorkflow] = useState([]);
  const [stepName, setStepName] = useState("");
  const [selectedComponents, setSelectedComponents] = useState([]);

  const addComponent = (c) => {
    setSelectedComponents([...selectedComponents, c]);
  };

  const saveStep = () => {
    if (!stepName) return alert("Please enter step name");

    const newStep = {
      stepName,
      components: selectedComponents
    };

    setWorkflow([...workflow, newStep]);
    setStepName("");
    setSelectedComponents([]);
  };

  return (
    <div>
      <h3>Create Workflow Step</h3>

      <input
        placeholder="Step Name"
        value={stepName}
        onChange={(e) => setStepName(e.target.value)}
      />

      <h4>Select Components:</h4>
      {/* Primitive components */}
      {componentLibrary.primitive.map((c) => (
        <button key={c.id} onClick={() => addComponent(c)}>
          {c.label}
        </button>
      ))}

      {/* Composite components */}
      {componentLibrary.composite.map((c) => (
        <button key={c.id} onClick={() => addComponent(c)}>
          {c.label} (Composite)
        </button>
      ))}

      <h4>Step Preview:</h4>
      <ul>
        {selectedComponents.map((c, idx) => (
          <li key={idx}>{c.label}</li>
        ))}
      </ul>

      <button onClick={saveStep}>Save Step</button>

      <h3>Workflow JSON</h3>
      <pre>{JSON.stringify(workflow, null, 2)}</pre>
    </div>
  );
};

export default WorkflowBuilder;
