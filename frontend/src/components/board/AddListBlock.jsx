import React, { useState } from "react";
import { Check, X } from "lucide-react";

const AddListBlock = ({ onCreate }) => {
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onCreate(title);
      setTitle("");
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 👉 CLOSED STATE
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="min-w-[270px] h-fit bg-[#ede9fe] hover:bg-[#ddd6fe] text-[#1e1b4b] 
                   rounded-xl p-3 text-sm text-left transition"
      >
        + Add another list
      </button>
    );
  }

  // 👉 OPEN STATE
  return (
    <div className="min-w-[270px] bg-white rounded-xl p-3 shadow-md border border-[#ddd6fe]">

      <input
        type="text"
        autoFocus
        placeholder="Enter list title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-2 py-1.5 mb-3 rounded-md border outline-none 
                   focus:ring-2 focus:ring-[#a78bfa] text-sm"
      />

      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-[#7c3aed] text-white p-2 rounded-md hover:bg-[#6d28d9] transition"
        >
          <Check size={16} />
        </button>

        <button
          onClick={() => {
            setOpen(false);
            setTitle("");
          }}
          className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
        >
          <X size={16} />
        </button>
      </div>

    </div>
  );
};

export default AddListBlock;