import React, { useState, useEffect } from "react";
import { createBoard } from "../../services/boardService";
import CreateBoardBlock from "./workspaces/CreateBoardBlock";
import BoardBlock from "./workspaces/BoardBlock";
import { useLocation, useNavigate } from "react-router-dom";

const Workspace = ({ selectedBoards = [], onRemoveBoard }) => {
  const [showCreate, setShowCreate] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openCreateBoard) {
      setShowCreate(true);
      navigate("/", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleCreateBoard = async (title) => {
    try {
      await createBoard({ title });
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full w-full flex flex-col gap-4 overflow-y-auto pr-2 no-scrollbar">

      {showCreate && (
        <CreateBoardBlock
          onCreate={handleCreateBoard}
          onClose={() => setShowCreate(false)}
        />
      )}

      {selectedBoards.length > 0 && (
        <div className="flex flex-col gap-4 w-full h-full">

          {selectedBoards.map((board) => (
            <div key={board._id} className="w-full max-w-full h-full">
              <BoardBlock
                board={board}
                onRemove={onRemoveBoard}
              />
            </div>
          ))}

        </div>
      )}

      {!showCreate && selectedBoards.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#1e1b4b] opacity-70">
            No board selected 🚀
          </p>
        </div>
      )}

    </div>
  );
};

export default Workspace;