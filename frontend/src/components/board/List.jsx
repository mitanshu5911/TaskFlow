import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";
import AddCardBlock from "./AddCardBlock";
import { createCard, getCardsByList } from "../../services/cardService";
import { updateList } from "../../services/listService";
import Card from "./Card";
import CardModal from "./CardModal";

const List = ({ list, onDelete, onUpdate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cards, setCards] = useState([]);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const menuRef = useRef();

  // 🔥 CLOSE MENU OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 FETCH CARDS
  useEffect(() => {
    fetchCards();
  }, [list._id]);

  const fetchCards = async () => {
    try {
      const data = await getCardsByList(list._id);
       setCards(data.filter((card) => !card.isArchived));

    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 CREATE CARD
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

  // 🔥 UPDATE LIST TITLE
  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);

      await updateList(list._id, { title });

      setEditing(false);

      onUpdate && onUpdate({ ...list, title });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(list.title);
    setEditing(false);
  };

  return (
    <div className="min-w-[270px] bg-[#f3f0ff] rounded-2xl p-3 shadow-sm border border-[#ede9fe] flex flex-col">
      
      {/* 🔥 HEADER */}
      <div className="flex items-center justify-between mb-3">

        {!editing ? (
          <h3 className="text-sm font-semibold text-[#1e1b4b] truncate px-1">
            {title}
          </h3>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              className="flex-1 px-2 py-1 text-sm rounded-md border outline-none focus:ring-2 focus:ring-[#a78bfa]"
            />

            <button
              onClick={handleSave}
              disabled={loading}
              className="p-1 bg-[#7c3aed] text-white rounded-md hover:bg-[#6d28d9]"
            >
              <Check size={14} />
            </button>

            <button
              onClick={handleCancel}
              className="p-1 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {!editing && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-lg hover:bg-[#e9e5ff]"
            >
              <MoreHorizontal size={18} className="text-[#7c3aed]" />
            </button>

            {menuOpen && (
              <div className="absolute top-8 right-0 w-40 bg-white border border-[#ddd6fe] rounded-xl shadow-xl z-50">

                <button
                  onClick={() => {
                    setEditing(true);
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
        )}
      </div>

      {/* 🔥 CARDS CONTAINER (FIXED) */}
      <div className="flex flex-col gap-2 max-h-[400px] overflow-x-auto pr-1">

        {cards.map((card) => (
          <Card
            key={card._id}
            card={card}

            // DELETE CARD
            onDelete={(id) => {
              setCards((prev) => prev.filter((c) => c._id !== id));
            }}

            onEdit={(card) => console.log("Edit", card)}

            // OPEN MODAL
            onOpen={(card) => setSelectedCard(card)}

            // 🔥 IMPORTANT: UPDATE FROM TOGGLE
            onUpdate={(updatedCard) => {
              setCards((prev) =>
                prev.map((c) =>
                  c._id === updatedCard._id ? updatedCard : c
                )
              );
            }}
          />
        ))}

        <AddCardBlock onCreate={handleCreateCard} />
      </div>

      {/* 🔥 CARD MODAL */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={(updatedCard) => {
            setCards((prev) =>
              prev.map((c) =>
                c._id === updatedCard._id ? updatedCard : c
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default List;