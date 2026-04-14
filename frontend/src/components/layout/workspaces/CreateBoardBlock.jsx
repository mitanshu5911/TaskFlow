import React, { useState } from "react";

const CreateBoardBlock = ({ onCreate, onClose }) => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Board title is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onCreate(title.trim());

      setTitle("");
    } catch (err) {
      console.error(err);
      setError("Failed to create board. Try again.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCreate();
    }
  };

  return (
    <div className="w-full bg-[#f3f0ff] border border-[#ddd6fe] rounded-2xl p-5 shadow-md transition-all duration-300">

    
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#1e1b4b]">
          Create New Board
        </h2>
        <p className="text-sm text-[#7c3aed]/70">
          Give your board a clear and meaningful name
        </p>
      </div>

      
      <input
        type="text"
        placeholder="e.g. Product Roadmap, Sprint Tasks..."
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError("");
        }}
        onKeyDown={handleKeyDown}
        className="w-full mb-2 px-3 py-2 rounded-lg border border-[#ddd6fe] bg-white outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-[#a78bfa] text-sm text-[#1e1b4b] placeholder:text-[#a78bfa]"
      />

      
      {error && (
        <p className="text-xs text-red-500 mb-3">{error}</p>
      )}

      
      <div className="flex gap-3">
        <button
          onClick={handleCreate}
          disabled={loading || !title.trim()}
          className="bg-[#7c3aed] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#6d28d9] transition disabled:opacity-50 shadow-sm"
        >
          {loading ? "Creating..." : "Create Board"}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition text-[#1e1b4b]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateBoardBlock;