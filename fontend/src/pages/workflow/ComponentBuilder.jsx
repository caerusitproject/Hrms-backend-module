import React, { useState } from "react";

const ComponentBuilder = ({ componentLibrary, setComponentLibrary }) => {
  const [compName, setCompName] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);

  const addField = (field) => {
    setSelectedFields([...selectedFields, field]);
  };

  const saveComposite = () => {
    if (!compName) return alert("Enter component name");

    const newComposite = {
      id: compName.toLowerCase().replace(/\s/g, ""),
      label: compName,
      fields: selectedFields,
    };

    setComponentLibrary({
      ...componentLibrary,
      composite: [...componentLibrary.composite, newComposite],
    });

    setCompName("");
    setSelectedFields([]);
  };

  return (
    <div>
      <h3>Create Composite Component</h3>

      <input
        placeholder="Component Name"
        value={compName}
        onChange={(e) => setCompName(e.target.value)}
      />

      <h4>Add Primitive Fields:</h4>
      {componentLibrary.primitive.map((p) => (
        <button key={p.id} onClick={() => addField(p)}>
          {p.label}
        </button>
      ))}

      <h4>Preview:</h4>
      <ul>
        {selectedFields.map((f, idx) => (
          <li key={idx}>{f.label}</li>
        ))}
      </ul>

      <button onClick={saveComposite}>Save Composite Component</button>

      <h3>Existing Composite Components</h3>
      <pre>{JSON.stringify(componentLibrary.composite, null, 2)}</pre>
    </div>
  );
};

export default ComponentBuilder;
