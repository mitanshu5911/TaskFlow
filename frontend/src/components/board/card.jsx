import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Pencil, Trash2, Archive } from "lucide-react";

const Card = ({ card, onDelete, onEdit, onOpen }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const menuRef = useRef();
  const buttonRef = useRef();

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

  return (
    <div
      onClick={() => onOpen(card)}
      className="relative group bg-white rounded-xl p-3 shadow-sm border border-[#ede9fe] hover:shadow-md transition cursor-pointer"
    >
      <p className="text-sm text-[#1e1b4b] font-medium">
        {card.title}
      </p>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
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
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
                setMenuOpen(false);
              }}
              className="menu-item"
            >
              <Pencil size={14} /> Edit
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card._id);
                setMenuOpen(false);
              }}
              className="menu-item text-red-500 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>

            <button className="menu-item">
              <Archive size={14} /> Archive
            </button>
          </div>,
          document.getElementById("portal-root")
        )}
    </div>
  );
};

export default Card;