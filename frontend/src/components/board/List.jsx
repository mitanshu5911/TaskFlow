import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import AddCardBlock from "./AddCardBlock";
import { createCard, getCardsByList } from "../../services/cardService";
import Card from "./Card";

const List = ({ list, onDelete, onUpdate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cards, setCards] = useState([]);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCards();
  }, [list._id]);

  const fetchCards = async () => {
    try {
      const data = await getCardsByList(list._id);
      setCards(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCard = async (title) => {
    try {
      const newCard = await createCard({
        title,
        listId: list._id,
      });

      setCards((prev) => [...prev, newCard]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-w-[270px] bg-[#f3f0ff] rounded-2xl p-3 shadow-sm border border-[#ede9fe] flex flex-col">

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#1e1b4b] truncate px-1">
          {list.title}
        </h3>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg hover:bg-[#e9e5ff]"
          >
            <MoreHorizontal size={18} className="text-[#7c3aed]" />
          </button>

          {menuOpen && (
            <div className="absolute top-8 right-0 w-40 bg-white border border-[#ddd6fe] rounded-xl shadow-xl">
              <button
                onClick={() => {
                  onUpdate(list);
                  setMenuOpen(false);
                }}
                className="menu-item"
              >
                <Pencil size={14} /> Edit
              </button>

              <button
                onClick={() => {
                  onDelete(list._id);
                  setMenuOpen(false);
                }}
                className="menu-item text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 max-h-[400px] overflow-visible pr-1">

        {cards.map((card) => (
          <Card
            key={card._id}
            card={card}
            onDelete={(id) => {
              setCards((prev) => prev.filter((c) => c._id !== id));
            }}
            onEdit={(card) => console.log("Edit", card)}
            onOpen={(card) => console.log("Open", card)}
          />
        ))}

        <AddCardBlock onCreate={handleCreateCard} />
      </div>
    </div>
  );
};

export default List;