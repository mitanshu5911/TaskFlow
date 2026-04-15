import React, { useEffect, useState } from "react";
import { X, Settings } from "lucide-react";
import {
  createList,
  getListsByBoard,
  deleteList,
} from "../../../services/listService";
import List from "../../board/List";
import AddListBlock from "../../board/AddListBlock";
import { moveCard } from "../../../services/cardService";

const BoardBlock = ({ board, onRemove }) => {
  const [lists, setLists] = useState([]);

  // 🔥 NEW: refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchLists();
  }, [board._id]);

  const fetchLists = async () => {
    try {
      const data = await getListsByBoard(board._id);
      setLists(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 CROSS LIST DRAG (FIXED)
  const handleCrossListDrop = async ({
    cardId,
    sourceListId,
    destinationListId,
  }) => {
    try {
      if (!cardId || sourceListId === destinationListId) return;

      // ✅ BACKEND UPDATE
      await moveCard(cardId, {
        sourceListId,
        destinationListId,
        sourceIndex: 0,
        destinationIndex: 0,
      });

      // 🔥 FORCE RE-RENDER OF ALL LISTS
      setRefreshKey((prev) => prev + 1);

    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateList = async (title) => {
    try {
      const newList = await createList({
        title,
        boardId: board._id,
      });

      setLists((prev) => [...prev, newList]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await deleteList(listId);
      setLists((prev) => prev.filter((l) => l._id !== listId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-md border border-[#ede9fe] flex flex-col relative overflow-visible">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#ede9fe] top-0 bg-white z-10 rounded-t-2xl">
        <h2 className="text-lg font-semibold text-[#1e1b4b] truncate">
          {board.title}
        </h2>

        <div className="flex gap-2">
          <button className="p-2 hover:bg-[#ede9fe] rounded-md transition">
            <Settings size={18} className="text-[#7c3aed]" />
          </button>

          <button
            onClick={() => onRemove(board._id)}
            className="p-2 hover:bg-red-100 rounded-md transition"
          >
            <X size={18} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* LIST CONTAINER */}
      <div className="flex-1 overflow-x-auto overflow-y-visible no-scrollbar relative">
        
        <div className="flex items-start gap-4 p-4 min-w-max">
          
          {lists.map((list) => (
            <List
              key={list._id + refreshKey} // 🔥 FIX: force remount
              list={list}
              onDelete={handleDeleteList}
              onCardDropFromOutside={handleCrossListDrop}
              onUpdate={(updatedList) => {
                setLists((prev) =>
                  prev.map((l) =>
                    l._id === updatedList._id ? updatedList : l
                  )
                );
              }}
            />
          ))}

          {/* ADD LIST */}
          <AddListBlock onCreate={handleCreateList} />

        </div>
      </div>
    </div>
  );
};

export default BoardBlock;