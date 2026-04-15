import React, { useEffect, useState } from "react";
import { X, Settings } from "lucide-react";
import { createList, getListsByBoard, deleteList } from "../../../services/listService";
import List from "../../board/List";
import AddListBlock from "../../board/AddListBlock";

const BoardBlock = ({ board, onRemove }) => {
  const [lists, setLists] = useState([]);

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
    <div className="w-full bg-white rounded-2xl shadow-md border border-[#ede9fe] flex flex-col">

      <div className="flex items-center justify-between px-4 py-3 border-b border-[#ede9fe]">
        <h2 className="text-lg font-semibold text-[#1e1b4b] truncate">
          {board.title}
        </h2>

        <div className="flex gap-2">
          <button className="p-2 hover:bg-[#ede9fe] rounded-md">
            <Settings size={18} className="text-[#7c3aed]" />
          </button>

          <button
            onClick={() => onRemove(board._id)}
            className="p-2 hover:bg-red-100 rounded-md"
          >
            <X size={18} className="text-red-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-visible no-scrollbar">
        <div className="flex gap-4 p-4 min-w-max">

          {lists.map((list) => (
            <List
              key={list._id}
              list={list}
              onDelete={handleDeleteList}
            />
          ))}

          <AddListBlock onCreate={handleCreateList} />

        </div>
      </div>

    </div>
  );
};

export default BoardBlock;