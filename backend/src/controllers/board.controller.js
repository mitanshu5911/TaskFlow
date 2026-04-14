import Board from "../models/Board.js";
import List from "../models/List.js";
import Card from "../models/Card.js";
import User from "../models/User.js";

export const createBoard = async (req, res) => {
  try {
    const { title, members } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Board title is required",
      });
    }

    const defaultUser = await User.findOne({ isDefault: true });

    let finalMembers = [];

    if (defaultUser) {
      finalMembers.push(defaultUser._id);
    }

    if (members && members.length > 0) {
      finalMembers = [...new Set([...finalMembers, ...members])];
    }

    const board = await Board.create({
      title,
      members: finalMembers,
    });

    const defaultLists = ["Todo", "In Progress", "Done"];

    const listsToCreate = defaultLists.map((title, index) => ({
      title,
      board: board._id,
      order: index + 1,
    }));

    await List.insertMany(listsToCreate);

    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBoards = async (req, res) => {
    try {
        const boards = await Board.find().sort({ createdAt: -1 });

        res.json(boards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



export const getBoardById = async (req, res) => {
    try {
        const boardId = req.params.id;

        // Get board
        const board = await Board.findById(boardId).populate(
            "members",
            "name email"
        );

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        const lists = await List.find({ board: boardId }).sort({ order: 1 });

        const listsWithCards = await Promise.all(
            lists.map(async (list) => {
                const cards = await Card.find({
                    list: list._id,
                    isArchived: false,
                })
                    .sort({ order: 1 })
                    .populate("members", "name email");

                return {
                    ...list.toObject(),
                    cards,
                };
            })
        );

        res.json({
            ...board.toObject(),
            lists: listsWithCards,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



export const updateBoard = async (req, res) => {
    try {
        const { title, members } = req.body;

        const updates = {};

        if (title !== undefined) updates.title = title;
        if (members !== undefined) updates.members = members;

        const board = await Board.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        res.json(board);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



export const deleteBoard = async (req, res) => {
    try {
        const boardId = req.params.id;

        const board = await Board.findByIdAndDelete(boardId);

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        await List.deleteMany({ board: boardId });
        await Card.deleteMany({ list: { $in: await List.find({ board: boardId }).distinct("_id") } });

        res.json({ message: "Board and related data deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};