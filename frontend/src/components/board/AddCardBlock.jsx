import React, { useState } from "react";
import { Check, X } from "lucide-react";

const AddCardBlock = ({ onCreate }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onCreate(title.trim());

      setTitle("");
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔒 CLOSED STATE
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left px-2 py-2 rounded-lg text-sm text-[#7c3aed] 
                   hover:bg-[#ede9fe] transition font-medium"
      >
        + Add a card
      </button>
    );
  }

  // 🔓 OPEN STATE
  return (
    <div className="bg-white rounded-xl p-3 shadow-md border border-[#ddd6fe]">

      {/* INPUT */}
      <textarea
        autoFocus
        placeholder="Enter card title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full resize-none px-2 py-2 rounded-md border outline-none 
                   focus:ring-2 focus:ring-[#a78bfa] text-sm mb-3"
        rows={2}
      />

      {/* ACTIONS */}
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

export default AddCardBlock;