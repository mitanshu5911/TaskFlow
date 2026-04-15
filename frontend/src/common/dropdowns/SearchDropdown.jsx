import React, { useEffect, useRef, useState } from "react";
import { searchCards } from "../../services/cardService";
import CardModal from "../../components/board/CardModal";

const SearchDropdown = ({ query, onClose }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const dropdownRef = useRef();

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const data = await searchCards(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [query]);

  // 🔥 CLOSE ON OUTSIDE CLICK (FIXED)
  useEffect(() => {
    const handler = (e) => {
      // ✅ IMPORTANT: if modal is open → do nothing
      if (selectedCard) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, selectedCard]);

  return (
    <>
      {/* DROPDOWN */}
      <div
        ref={dropdownRef}
        className="absolute top-full mt-2 w-full bg-white border border-[#ddd6fe] rounded-2xl shadow-2xl z-50 p-3 max-h-[60vh] overflow-y-auto backdrop-blur-md"
      >
        {/* LOADING */}
        {loading && (
          <p className="text-sm text-gray-500 px-2 py-2">Searching...</p>
        )}

        {/* NO RESULT */}
        {!loading && results.length === 0 && (
          <p className="text-sm text-gray-400 px-2 py-2">
            No results found
          </p>
        )}

        {/* RESULTS */}
        {results.map((item) => (
          <div
            key={item._id}
            onClick={() => setSelectedCard(item.card)}
            className="p-3 rounded-xl hover:bg-[#f3f0ff] cursor-pointer transition"
          >
            <p className="text-sm font-medium text-[#1e1b4b]">
              {item.title}
            </p>

            <p className="text-xs text-gray-500">
              {item.boardName} • {item.listName}
            </p>
          </div>
        ))}
      </div>

      {/* 🔥 CARD MODAL */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)} // ✅ only closes modal
          onUpdate={() => {}}
        />
      )}
    </>
  );
};

export default SearchDropdown;