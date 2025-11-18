import React, { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";

const SimpleTable = ({ title, data, onAdd, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item.name);
  };

  const handleSave = () => {
    onEdit(editingId, editValue);
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-medium"
        >
          + Add {title}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{item.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleTable;