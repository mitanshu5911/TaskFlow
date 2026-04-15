import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Pencil, Trash2, Archive, Check } from "lucide-react";
import { archiveCard, deleteCard, toggleCardComplete } from "../../services/cardService";

const Card = ({ card, onDelete, onEdit, onOpen, onUpdate, onDrop }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [completed, setCompleted] = useState(card.isCompleted || false);
  const [loading, setLoading] = useState(false);

  const menuRef = useRef();
  const buttonRef = useRef();

  // 🔥 FIX: ensure completed stays in sync if parent updates
  useEffect(() => {
    setCompleted(card.isCompleted || false);
  }, [card.isCompleted]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ Toggle complete
  const handleToggle = async (e) => {
    e.stopPropagation();
    if (loading) return;

    try {
      setLoading(true);

      const updated = await toggleCardComplete(card._id);

      setCompleted(updated.isCompleted);
      onUpdate && onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();

    try {
      await deleteCard(card._id);
      onDelete && onDelete(card._id);
    } catch (err) {
      console.error(err);
    } finally {
      setMenuOpen(false);
    }
  };

  const handleArchive = async (e) => {
    e.stopPropagation();

    try {
      const updated = await archiveCard(card._id);

      onDelete && onDelete(card._id);
      onUpdate && onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();

        // 🔥 FIX: ensure correct list id
        const sourceListId = typeof card.list === "object"
          ? card.list._id
          : card.list;

        e.dataTransfer.setData("cardId", card._id);
        e.dataTransfer.setData("sourceListId", sourceListId);

        // 🔥 drag effect
        e.currentTarget.classList.add("opacity-50", "scale-95");
      }}
      onDragEnd={(e) => {
        // 🔥 CLEANUP
        e.currentTarget.classList.remove("opacity-50", "scale-95");
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop && onDrop(card._id, e);
      }}
      onClick={() => onOpen(card)}
      className={`relative group rounded-xl p-3 shadow-sm border cursor-pointer
        transition-all duration-200
        ${
          completed
            ? "bg-[#ede9fe] border-[#c4b5fd] opacity-80"
            : "bg-white border-[#ede9fe]"
        }
        hover:shadow-md
        pl-3 group-hover:pl-10
      `}
    >
      {/* ✅ CHECKBOX */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`
          absolute left-3 top-3 w-5 h-5 rounded-md flex items-center justify-center border
          transition-all duration-200

          ${
            completed
              ? "bg-[#7c3aed] border-[#7c3aed] opacity-100"
              : "border-[#c4b5fd] opacity-0 group-hover:opacity-100 hover:bg-[#ede9fe] hover:scale-110 "
          }
        `}
      >
        {completed && <Check size={12} className="text-white" />}
      </button>

      <p
        className={`text-sm font-medium transition-all duration-200 group-hover:mx-7
          ${completed ? "line-through text-gray-400 mx-7" : "text-[#1e1b4b]"}`}
      >
        {card.title}
      </p>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();

            const rect = buttonRef.current.getBoundingClientRect();

            setMenuPosition({
              top: rect.bottom + window.scrollY + 6,
              left: rect.right + window.scrollX - 180,
            });

            setMenuOpen((prev) => !prev);
          }}
          className="p-1.5 rounded-md hover:bg-[#ede9fe]"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* ✅ DROPDOWN MENU */}
      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed w-44 bg-white border border-[#ddd6fe] rounded-xl shadow-2xl z-[999999]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen(card);
                setMenuOpen(false);
              }}
              className="menu-item"
            >
              Open Card
            </button>

            <button
              onClick={handleDelete}
              className="menu-item text-red-500 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>

            <button
              onClick={handleArchive}
              className="menu-item hover:bg-yellow-50"
            >
              <Archive size={14} /> Archive
            </button>
          </div>,
          document.getElementById("portal-root")
        )}
    </div>
  );
};

export default Card;