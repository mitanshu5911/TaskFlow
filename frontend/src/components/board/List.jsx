import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2, Check, X, Filter } from "lucide-react";
import AddCardBlock from "./AddCardBlock";
import { createCard, getFilteredCards } from "../../services/cardService";
import { updateList } from "../../services/listService";
import CardModal from "./CardModal";
import Card from "./Card";

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
  { name: "Review", color: "#06b6d4" },
];

const List = ({
  list,
  cards = [],
  onDelete,
  onUpdate,
  onCardDropFromOutside,
  onCardUpdate,
  onCardDelete,
}) => {
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
    dueDate: "",
  });

  // ✅ FIXED: only API filtered state
  const [apiFilteredCards, setApiFilteredCards] = useState(null);

  // 🔥 FILTER HANDLER
  const fetchFilteredCards = async () => {
    try {
      const active = {
        ...filters,
        labels: filters.labels.join(","),
      };

      const cleaned = Object.fromEntries(
        Object.entries(active).filter(
          ([_, v]) => v !== "" && (!Array.isArray(v) || v.length !== 0),
        ),
      );

      if (Object.keys(cleaned).length === 0) {
        setApiFilteredCards(null);
        setFilterOpen(false);
        return;
      }

      const data = await getFilteredCards(list._id, cleaned);
      setApiFilteredCards(data);
      setFilterOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DERIVED STATE (IMPORTANT FIX)
  const displayCards = apiFilteredCards || cards;

  // 🔥 OUTSIDE CLICK
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
        listId: list._id,
      });

      onCardUpdate && onCardUpdate(newCard);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = (id) => {
    onCardDelete && onCardDelete(id);
  };

  const handleUpdateCard = (updatedCard) => {
    onCardUpdate && onCardUpdate(updatedCard);
  };

  // 🔥 LIST UPDATE
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

  // 🔥 DROP
  const handleDrop = (e) => {
    e.preventDefault();

    const cardId = e.dataTransfer.getData("cardId");
    const sourceListId = e.dataTransfer.getData("sourceListId");
    const sourceIndex = Number(e.dataTransfer.getData("sourceIndex"));

    onCardDropFromOutside &&
      onCardDropFromOutside({
        cardId,
        sourceListId,
        destinationListId: list._id,
        sourceIndex,
        destinationIndex: displayCards.length,
      });
  };

  return (
    <div
      className="min-w-[270px] bg-[#f3f0ff] rounded-2xl p-3 shadow-sm border border-[#ede9fe] flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        {!editing ? (
          <h3 className="text-sm font-semibold text-[#1e1b4b] truncate px-1">
            {title}
          </h3>
        ) : (
          <div className="flex gap-2 w-full">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-2 py-1 border rounded-md text-sm"
            />
            <button
              onClick={handleSave}
              className="p-1 bg-[#7c3aed] text-white rounded-md"
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 bg-gray-200 rounded-md"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {!editing && (
          <div className="flex gap-2">
            {/* 🔥 FULL FILTER UI RESTORED */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((p) => !p)}
                className="p-1.5 hover:bg-[#e9e5ff] rounded-lg"
              >
                <Filter size={18} className="text-[#7c3aed]" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-[260px] bg-white border border-[#ddd6fe] rounded-2xl shadow-2xl p-4 space-y-4 z-50">
                  {/* STATUS */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setFilters({ ...filters, isCompleted: "" })
                      }
                      className={`px-3 py-1 text-xs rounded-full border transition
        ${
          filters.isCompleted === ""
            ? "bg-gray-800 text-white border-gray-800"
            : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
                    >
                      All
                    </button>

                    <button
                      onClick={() =>
                        setFilters({ ...filters, isCompleted: "true" })
                      }
                      className={`px-3 py-1 text-xs rounded-full border transition
        ${
          filters.isCompleted === "true"
            ? "bg-green-500 text-white border-green-500"
            : "border-green-400 text-green-600 hover:bg-green-50"
        }`}
                    >
                      Completed
                    </button>

                    <button
                      onClick={() =>
                        setFilters({ ...filters, isCompleted: "false" })
                      }
                      className={`px-3 py-1 text-xs rounded-full border transition
        ${
          filters.isCompleted === "false"
            ? "bg-red-500 text-white border-red-500"
            : "border-red-400 text-red-500 hover:bg-red-50"
        }`}
                    >
                      Incomplete
                    </button>
                  </div>

                  {/* MEMBER */}
                  <input
                    placeholder="Member email"
                    value={filters.member}
                    onChange={(e) =>
                      setFilters({ ...filters, member: e.target.value })
                    }
                    className="w-full px-2 py-1 border rounded-md text-sm
               focus:ring-2 focus:ring-[#a78bfa] outline-none transition"
                  />

                  {/* DATE */}
                  <input
                    type="date"
                    value={filters.dueDate}
                    onChange={(e) =>
                      setFilters({ ...filters, dueDate: e.target.value })
                    }
                    className="w-full px-2 py-1 border rounded-md text-sm
               focus:ring-2 focus:ring-[#a78bfa] outline-none transition"
                  />

                  {/* LABELS */}
                  <div className="flex flex-wrap gap-2">
                    {LABELS.map((l) => {
                      const active = filters.labels.includes(l.name);

                      return (
                        <button
                          key={l.name}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              labels: active
                                ? prev.labels.filter((x) => x !== l.name)
                                : [...prev.labels, l.name],
                            }))
                          }
                          className="px-2 py-1 text-xs rounded-full border transition"
                          style={{
                            borderColor: l.color,
                            backgroundColor: active ? l.color : "white",
                            color: active ? "white" : l.color,
                          }}
                        >
                          {l.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* APPLY BUTTON */}
                  <button
                    onClick={fetchFilteredCards}
                    className="w-full bg-[#7c3aed] text-white py-2 rounded-lg text-sm
               hover:bg-[#6d28d9] transition active:scale-95"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* MENU */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="p-1.5 hover:bg-[#e9e5ff] rounded-lg"
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <div className="absolute top-8 right-0 w-40 bg-white border rounded-xl shadow-xl z-9999">
                  <button
                    onClick={() => setEditing(true)}
                    className="menu-item"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(list._id)}
                    className="menu-item text-red-500"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CARDS */}
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
        {displayCards.map((card, index) => (
          <Card
            key={card._id}
            card={card}
            index={index}
            listId={list._id}
            onOpen={setSelectedCard}
            onDelete={handleDeleteCard}
            onUpdate={handleUpdateCard}
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
