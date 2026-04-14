import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BoardsDropdown = ({ onClose }) => {
  const navigate = useNavigate();

  const handleCreateBoard = () => {
    navigate("/", { state: { openCreateBoard: true } });
    onClose();
  };

  return (
    <div className="absolute top-10 left-0 w-60 bg-white border border-[#ddd6fe] rounded-xl shadow-lg p-2 z-50 animate-fadeIn">

      

      {/* CREATE BOARD */}
      <button
        onClick={handleCreateBoard}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#ede9fe] transition text-sm text-[#1e1b4b]"
      >
        <Plus size={16} className="text-[#7c3aed]" />
        Create new board
      </button>

      
    </div>
  );
};

export default BoardsDropdown;