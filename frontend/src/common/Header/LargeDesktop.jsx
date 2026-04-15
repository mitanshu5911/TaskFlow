import { Bell, ChevronDown, Plus, Search, User } from "lucide-react";
import React, { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoardsDropdown from "../dropdowns/BoardsDropdown";

const LargeDesktop = () => {
  const navigate = useNavigate();
  const [isBoardsMenuOpen, setIsBoardsMenuOpen] = useState(false);
  const onSearch = () => {
    // Implement search functionality here
    console.log("Search button clicked");
  };
  return (
    <header className="sticky top-0 z-10 h-16 w-full bg-white border-b border-[#ddd6fe] px-6 flex items-center justify-between">
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
            className="group flex items-center gap-1 text-[#1e1b4b] px-3 py-1.5 rounded-md transition-all duration-200 hover:bg-linear-to-r hover:from-[#ede9fe] hover:to-[#ddd6fe] hover:shadow-sm hover:-translate-y-px cursor-pointer"
          >
            <span className="font-medium">Boards</span>

            <ChevronDown
              size={16}
              className={`transition-transform duration-500 ${
                isBoardsMenuOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {isBoardsMenuOpen && (
            <BoardsDropdown onClose={() => setIsBoardsMenuOpen(false)} />
          )}
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="flex items-center w-105 bg-[#fdfcff] border border-[#ddd6fe] rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#a78bfa] transition">
          <Search size={18} className="text-[#7c3aed] mr-2" />
          <input
            type="text"
            placeholder="Search tasks, cards..."
            className="flex-1 bg-transparent outline-none text-sm text-[#1e1b4b] placeholder:text-[#a78bfa]"
          />

          <button
            onClick={onSearch}
            className="ml-2 bg-[#7c3aed] text-white px-3 py-1 rounded-full text-xs hover:bg-[#6d28d9] transition cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">
        {/* Create Button */}
        <button className="bg-[#7c3aed] text-white p-2 rounded-md hover:bg-[#6d28d9] transition">
          <Plus size={18} />
        </button>

        {/* Notification */}
        <button className="p-2 hover:bg-[#ede9fe] rounded-md transition">
          <Bell size={18} className="text-[#1e1b4b]" />
        </button>

        {/* Profile Avatar */}
        <div className="w-9 h-9 bg-[#a78bfa] text-white flex items-center justify-center rounded-full font-semibold cursor-pointer">
          <User size={18} />
        </div>
      </div>
    </header>
  );
};

export default LargeDesktop;
