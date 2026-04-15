import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Workspace from "../components/layout/Workspace";
import { getBoards } from "../services/boardService";

const Home = () => {
  const [selectedBoards, setSelectedBoards] = useState(() => {
    const saved = localStorage.getItem("selectedBoards");
    return saved ? JSON.parse(saved) : [];
  });

  const [boards, setBoards] = useState([]);

  useEffect(()=>{
    fetchBoards();
  },[]);

  const fetchBoards = async () => {
  try {
    const data = await getBoards();
    setBoards(data);
  } catch (err) {
    console.error(err);
  }
};

  const handleSelectBoard = (board) => {
    setSelectedBoards((prev) => {
      const filtered = prev.filter((b) => b._id !== board._id);
      const updated = [board, ...filtered];

      localStorage.setItem("selectedBoards", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveBoard = (boardId) => {
    setSelectedBoards((prev) => {
      const updated = prev.filter((b) => b._id !== boardId);
      localStorage.setItem("selectedBoards", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-gradient-to-br from-[#6d28d9] via-[#7c3aed] to-[#a78bfa] p-4 isolate">

      <div className="flex h-full gap-4">

        <div className="w-64 h-full bg-[#ede9fe]/80 rounded-2xl p-4 flex-shrink-0">
          <Sidebar boards={boards} onSelectBoard={handleSelectBoard} />
        </div>

        <div className="flex-1 h-full overflow-hidden">
          <Workspace
            selectedBoards={selectedBoards}
  onRemoveBoard={handleRemoveBoard}
  setBoards={setBoards}
  setSelectedBoards={setSelectedBoards}
          />
        </div>

      </div>

    </div>
  );
};

export default Home;