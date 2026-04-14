import React, { useEffect, useState } from "react";
import { getBoards } from "../../services/boardService";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Sidebar = ({ onSelectBoard }) => {
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const data = await getBoards();
      setBoards(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (board) => {
    setActiveBoardId(board._id);
    onSelectBoard(board);
  };

  const visibleBoards = boards.slice(0, 9);

  return (
    <div className="h-full flex flex-col">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[#7c3aed] uppercase tracking-wide">
          My Boards
        </h2>
        <p className="text-xs text-[#7c3aed]/60 mt-1">
          Quick access to your boards
        </p>
      </div>

      {/* BOARD LIST */}
      <div className="flex-1 flex flex-col gap-1 pr-1">

        {visibleBoards.map((board) => (
          <button
            key={board._id}
            onClick={() => handleSelect(board)}
            className={`group relative text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between
              
              ${
                activeBoardId === board._id
                  ? "bg-[#ddd6fe] text-[#5b21b6] font-medium shadow-sm"
                  : "text-[#1e1b4b] hover:bg-[#ede9fe]"
              }
            `}
          >
            {/* TITLE */}
            <span className="truncate">{board.title}</span>

            <div className="w-5 flex justify-end">
              <ArrowRight
                size={16} 
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-[#7c3aed] translate-x-1 group-hover:translate-x-0"
              />
            </div>
          </button>
        ))}

      </div>

      {/* MORE BUTTON */}
      {boards.length > 10 && (
        <div className="mt-4">
          <button
            onClick={() => navigate("/boards")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl 
                       bg-linear-to-r from-[#7c3aed] to-[#a78bfa] 
                       text-white text-sm font-medium 
                       hover:from-[#6d28d9] hover:to-[#8b5cf6] 
                       transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View All Boards →
          </button>
        </div>
      )}

    </div>
  );
};

export default Sidebar;