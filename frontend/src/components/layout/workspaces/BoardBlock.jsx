import React, { useEffect, useState } from "react";
import { X, Settings } from "lucide-react";
import {
  createList,
  deleteList,
} from "../../../services/listService";
import { getBoardById } from "../../../services/boardService";
import List from "../../board/List";
import AddListBlock from "../../board/AddListBlock";
import { moveCard } from "../../../services/cardService";

const BoardBlock = ({ board, onRemove }) => {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    fetchBoard();
  }, [board._id]);

  const fetchBoard = async () => {
    try {
      const data = await getBoardById(board._id);
      setLists(data.lists || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 DRAG HANDLER
  const handleCrossListDrop = async ({
    cardId,
    sourceListId,
    destinationListId,
    sourceIndex,
    destinationIndex,
  }) => {
    try {
      await moveCard(cardId, {
        sourceListId,
        destinationListId,
        sourceIndex,
        destinationIndex,
      });

      fetchBoard(); // ✅ single source of truth
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateList = async (title) => {
    try {
      await createList({
        title,
        boardId: board._id,
      });

      fetchBoard();
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

  const handleUpdateListLocal = (updatedList) => {
    setLists((prev) =>
      prev.map((l) =>
        l._id === updatedList._id ? updatedList : l
      )
    );
  };

  const handleUpdateCardLocal = (listId, updatedCard) => {
  setLists((prev) =>
    prev.map((list) => {
      if (list._id !== listId) return list;

      const exists = list.cards.some(
        (c) => c._id === updatedCard._id
      );

      return {
        ...list,
        cards: exists
          ? list.cards.map((c) =>
              c._id === updatedCard._id ? updatedCard : c
            )
          : [...list.cards, updatedCard], // ✅ ADD NEW CARD
      };
    })
  );
};

  const handleDeleteCardLocal = (listId, cardId) => {
    setLists((prev) =>
      prev.map((list) => {
        if (list._id !== listId) return list;

        return {
          ...list,
          cards: list.cards.filter((c) => c._id !== cardId),
        };
      })
    );
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-md border border-[#ede9fe] flex flex-col relative overflow-visible">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#ede9fe] bg-white z-10 rounded-t-2xl">
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

      {/* LISTS */}
      <div className="flex-1 overflow-x-auto overflow-y-visible no-scrollbar">
        <div className="flex items-start gap-4 p-4 min-w-max">

          {lists.map((list) => (
            <List
              key={list._id}
              list={list}
              cards={list.cards || []} // 🔥 IMPORTANT
              onDelete={handleDeleteList}
              onUpdate={handleUpdateListLocal}
              onCardDropFromOutside={handleCrossListDrop}
              onCardUpdate={(card) =>
                handleUpdateCardLocal(list._id, card)
              }
              onCardDelete={(cardId) =>
                handleDeleteCardLocal(list._id, cardId)
              }
            />
          ))}

          <AddListBlock onCreate={handleCreateList} />

        </div>
      </div>
    </div>
  );
};

export default BoardBlock;