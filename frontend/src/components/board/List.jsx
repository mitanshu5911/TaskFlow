import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2, Check, X, Filter } from "lucide-react";
import AddCardBlock from "./AddCardBlock";
import {
  createCard,
  getCardsByList,
  getFilteredCards,
  moveCard
} from "../../services/cardService";
import { updateList } from "../../services/listService";
import Card from "./Card";
import CardModal from "./CardModal";

const LABELS = [
  { name: "Feature", color: "#7c3aed" },
  { name: "Bug", color: "#fb7185" },
  { name: "UI", color: "#38bdf8" },
  { name: "Backend", color: "#f97316" },
  { name: "Urgent", color: "#facc15" },
  { name: "Low", color: "#4ade80" },
  { name: "Design", color: "#a78bfa" },
  { name: "Testing", color: "#c4b5fd" },
  { name: "Blocked", color: "#ef4444" },
  { name: "Review", color: "#06b6d4" }
];

const List = ({ list, onDelete, onUpdate, onCardDropFromOutside }) => {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [loading, setLoading] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);

  const menuRef = useRef();
  const filterRef = useRef();

  const [filters, setFilters] = useState({
    labels: [],
    isCompleted: "",
    member: "",
    dueDate: ""
  });

  // 🔥 FETCH CARDS
  useEffect(() => {
    fetchCards();
  }, [list._id]);

  const fetchCards = async () => {
    try {
      const data = await getCardsByList(list._id);
      setCards(data.filter((c) => !c.isArchived));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 FILTER
  const fetchFilteredCards = async () => {
    try {
      const active = {
        ...filters,
        labels: filters.labels.join(",")
      };

      const cleaned = Object.fromEntries(
        Object.entries(active).filter(
          ([_, v]) => v !== "" && (!Array.isArray(v) || v.length !== 0)
        )
      );

      if (Object.keys(cleaned).length === 0) {
        return fetchCards();
      }

      const data = await getFilteredCards(list._id, cleaned);
      setCards(data);
      setFilterOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 CLOSE OUTSIDE CLICK
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🔥 CREATE CARD
  const handleCreateCard = async (title) => {
    try {
      const newCard = await createCard({
        title,
        listId: list._id
      });

      setCards((prev) => [...prev, newCard]);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 DELETE CARD
  const handleDeleteCard = (id) => {
    setCards((prev) => prev.filter((c) => c._id !== id));
  };

  // 🔥 UPDATE CARD
  const handleUpdateCard = (updatedCard) => {
    setCards((prev) =>
      prev.map((c) => (c._id === updatedCard._id ? updatedCard : c))
    );
  };

  // 🔥 SAME LIST DRAG
  const handleDropCard = async (targetCardId, e) => {
    try {
      const draggedId = e.dataTransfer.getData("cardId");

      if (!draggedId || draggedId === targetCardId) return;

      const newCards = [...cards];

      const fromIndex = newCards.findIndex(c => c._id === draggedId);
      const toIndex = newCards.findIndex(c => c._id === targetCardId);

      const [moved] = newCards.splice(fromIndex, 1);
      newCards.splice(toIndex, 0, moved);

      setCards(newCards);

      await moveCard(draggedId, {
        sourceListId: list._id,
        destinationListId: list._id,
        sourceIndex: fromIndex,
        destinationIndex: toIndex,
      });

    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 CROSS LIST DROP FIX
  const handleExternalDrop = (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    const sourceListId = e.dataTransfer.getData("sourceListId");

    if (!cardId) return;

    // 🔥 REMOVE from source list instantly (fix ghost bug)
    if (sourceListId === list._id) {
      setCards((prev) => prev.filter((c) => c._id !== cardId));
    }

    onCardDropFromOutside &&
      onCardDropFromOutside({
        cardId,
        sourceListId,
        destinationListId: list._id,
      });
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
    <div
      className="min-w-[270px] bg-[#f3f0ff] rounded-2xl p-3 shadow-sm border border-[#ede9fe] flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleExternalDrop} // 🔥 FIXED
    >

      {/* HEADER */}
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
              className="flex-1 px-2 py-1 text-sm rounded-md border"
            />

            <button onClick={handleSave} className="p-1 bg-[#7c3aed] text-white rounded-md">
              <Check size={14} />
            </button>

            <button onClick={handleCancel} className="p-1 bg-gray-200 rounded-md">
              <X size={14} />
            </button>
          </div>
        )}

        {!editing && (
          <div className="flex items-center gap-2">

            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className="p-1.5 rounded-lg hover:bg-[#e9e5ff]"
              >
                <Filter size={18} className="text-[#7c3aed]" />
              </button>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-1.5 rounded-lg hover:bg-[#e9e5ff]"
              >
                <MoreHorizontal size={18} className="text-[#7c3aed]" />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* CARDS */}
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
        {cards.map((card) => (
          <Card
            key={card._id}
            card={card}
            onOpen={setSelectedCard}
            onDelete={handleDeleteCard}
            onUpdate={handleUpdateCard}
            onDrop={handleDropCard}
          />
        ))}

        <AddCardBlock onCreate={handleCreateCard} />
      </div>

      {/* MODAL */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
        />
      )}
    </div>
  );
};

export default List;