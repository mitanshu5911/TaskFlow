import { Bell, ChevronDown, Plus, Search, User } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BoardsDropdown from "../dropdowns/BoardsDropdown";
import SearchDropdown from "../dropdowns/SearchDropdown";

const LargeDesktop = () => {
  const navigate = useNavigate();
  const [isBoardsMenuOpen, setIsBoardsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const onSearch = () => {
    if (!searchQuery.trim()) return;
    setShowDropdown(true);
  };

  return (
    <header className="sticky top-0 z-10 h-16 w-full bg-white border-b border-[#ddd6fe] px-6 flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1 cursor-pointer">
          <div className="relative w-8 h-8">
            <div className="absolute w-6 h-6 bg-[#c4b5fd] rounded-md top-1 left-1 shadow-sm"></div>
            <div className="absolute w-6 h-6 bg-[#7c3aed] rounded-md flex items-center justify-center text-white font-semibold text-sm shadow-md">
              T
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1e1b4b] tracking-tight">
            Task<span className="text-[#7c3aed]">Deck</span>
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsBoardsMenuOpen(!isBoardsMenuOpen)}
            className="group flex items-center gap-1 text-[#1e1b4b] px-3 py-1.5 rounded-md hover:bg-[#ede9fe]"
          >
            <span className="font-medium">Boards</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${
                isBoardsMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isBoardsMenuOpen && (
            <BoardsDropdown onClose={() => setIsBoardsMenuOpen(false)} />
          )}
        </div>
      </div>

      {/* 🔥 CENTER SEARCH (FIXED) */}
      <div className="flex-1 flex justify-center">
        
        {/* ✅ IMPORTANT: single relative wrapper */}
        <div className="relative w-[420px]">

          {/* SEARCH BAR */}
          <div className="flex items-center w-full bg-[#fdfcff] border border-[#ddd6fe] rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#a78bfa] transition">
            <Search size={18} className="text-[#7c3aed] mr-2" />

            <input
              type="text"
              placeholder="Search tasks, cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-[#1e1b4b] placeholder:text-[#a78bfa]"
            />

            <button
              onClick={onSearch}
              className="ml-2 bg-[#7c3aed] text-white px-3 py-1 rounded-full text-xs hover:bg-[#6d28d9]"
            >
              Search
            </button>
          </div>

          {/* 🔥 DROPDOWN (PERFECTLY ALIGNED) */}
          {showDropdown && (
            <SearchDropdown
              query={searchQuery}
              onClose={() => setShowDropdown(false)}
            />
          )}

        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <button className="bg-[#7c3aed] text-white p-2 rounded-md hover:bg-[#6d28d9]">
          <Plus size={18} />
        </button>

        <button className="p-2 hover:bg-[#ede9fe] rounded-md">
          <Bell size={18} className="text-[#1e1b4b]" />
        </button>

        <div className="w-9 h-9 bg-[#a78bfa] text-white flex items-center justify-center rounded-full">
          <User size={18} />
        </div>
      </div>
    </header>
  );
};

export default LargeDesktop;