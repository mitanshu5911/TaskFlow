import React, { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { updateCard } from "../../services/cardService";

const HEADER_HEIGHT = "4rem";

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

const CardModal = ({ card, onClose, onUpdate }) => {
  const [editTitle, setEditTitle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [memberInput, setMemberInput] = useState("");

  const [form, setForm] = useState({
    title: card?.title || "",
    description: card?.description || "",
    dueDate: card?.dueDate?.slice(0, 10) || "",
    labels: card?.labels || [],
    members: card?.members?.map((m) => m.email) || [],
    attachments: card?.attachments || [],
    isCompleted: card?.isCompleted || false,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!card) return null;

const handleSave = async () => {
  try {
    setLoading(true);

    // ✅ CLEAN PAYLOAD (IMPORTANT)
    const payload = {};

    if (form.title) payload.title = form.title;
    if (form.description !== undefined) payload.description = form.description;

    // ✅ handle dueDate properly
    if (form.dueDate !== undefined) {
      payload.dueDate = form.dueDate || null;
    }

    // ✅ labels
    if (form.labels?.length >= 0) {
      payload.labels = form.labels;
    }

    // ✅ members (emails)
    if (form.members?.length >= 0) {
      payload.members = form.members.filter((m) => m.includes("@"));
    }

    // ✅ attachments
    if (form.attachments?.length >= 0) {
      payload.attachments = form.attachments;
    }

    // ✅ status
    payload.isCompleted = form.isCompleted;

    console.log("UPDATE PAYLOAD:", payload); // 🔥 DEBUG

    const updated = await updateCard(card._id, payload);

    onUpdate && onUpdate(updated);
    onClose();
  } catch (err) {
    console.error("SAVE ERROR:", err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};

  const addMember = () => {
    if (!memberInput.trim()) return;
    setForm({
      ...form,
      members: [...new Set([...form.members, memberInput])]
    });
    setMemberInput("");
  };

  const removeLabel = (index) => {
    const updated = [...form.labels];
    updated.splice(index, 1);
    setForm({ ...form, labels: updated });
  };

  return (
    <>
      <style>{`
        .fadeIn { animation: fadeIn 0.25s ease-out; }
        .slideUp { animation: slideUp 0.3s ease-out; }

        @keyframes fadeIn {
          from { opacity: 0 } to { opacity: 1 }
        }

        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
      `}</style>

      <div
        onClick={onClose}
        className="fixed left-0 w-full z-[9999] backdrop-blur-sm bg-black/30 flex justify-center fadeIn"
        style={{
          top: HEADER_HEIGHT,
          height: `calc(100vh - ${HEADER_HEIGHT})`,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="slideUp mt-6 w-full max-w-4xl bg-[#f5f3ff] rounded-3xl shadow-xl flex flex-col max-h-[88vh] pb-2"
        >

          {/* HEADER */}
          <div className="p-6 border-b flex items-center gap-3 sticky top-0 bg-[#f5f3ff]">
            {editTitle ? (
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                className="text-2xl font-semibold border px-3 py-2 rounded w-full"
              />
            ) : (
              <h2 className="text-2xl font-semibold flex-1">
                {form.title}
              </h2>
            )}

            <button onClick={() => setEditTitle(!editTitle)}>
              {editTitle ? <Check /> : <Pencil />}
            </button>

            <button
              onClick={onClose}
              className="bg-white p-2 rounded-lg shadow hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-6 overflow-y-auto ">

            {/* DESCRIPTION */}
            <div className="mb-6">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full p-4 rounded-xl border mt-2"
              />
            </div>

            {/* GRID */}
            <div className="grid md:grid-cols-2 gap-8 mb-8 items-start">

              {/* DATE */}
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  className="w-full mt-2 p-3 border rounded-xl"
                />
              </div>

              {/* STATUS */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Status</label>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      form.isCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {form.isCompleted ? "Completed" : "Pending"}
                  </span>

                  <button
                    onClick={() =>
                      setForm({ ...form, isCompleted: !form.isCompleted })
                    }
                    className="text-xs px-3 py-1 rounded-lg border hover:bg-gray-50"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            </div>

            {/* LABELS */}
            <div className="mb-6">
              <label className="text-sm font-medium">Labels</label>

              <div className="flex flex-wrap gap-2 mt-2">
                {LABELS.map((l) => (
                  <div
                    key={l.name}
                    onClick={() =>
                      setForm({
                        ...form,
                        labels: [...form.labels, l]
                      })
                    }
                    className="px-3 py-1 rounded-full text-white text-xs cursor-pointer hover:scale-105"
                    style={{ backgroundColor: l.color }}
                  >
                    {l.name}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {form.labels.map((l, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: l.color }}
                  >
                    {l.name}
                    <button onClick={() => removeLabel(i)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* MEMBERS */}
            <div className="mb-6">
              <label className="text-sm font-medium">Members</label>

              <div className="flex gap-2 mt-2">
                <input
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  placeholder="Enter email"
                  className="flex-1 p-3 border rounded-xl"
                />
                <button
                  onClick={addMember}
                  className="bg-[#7c3aed] text-white px-4 rounded-xl"
                >
                  Add
                </button>
              </div>

              <div className="flex gap-2 flex-wrap mt-3">
                {form.members.map((m) => (
                  <div
                    key={m}
                    className="flex items-center gap-2 bg-[#ddd6fe] px-3 py-1 rounded-full text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-xs">
                      {m[0]?.toUpperCase()}
                    </div>
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* ATTACHMENTS */}
            <div className="mb-6">
              <label className="text-sm font-medium">Attachments</label>
              <input type="file" className="mt-2" />
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-5 border-t bg-[#f5f3ff] rounded-b-3xl">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white py-3 rounded-2xl text-lg shadow-md hover:shadow-xl hover:scale-[1.01] transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default CardModal;