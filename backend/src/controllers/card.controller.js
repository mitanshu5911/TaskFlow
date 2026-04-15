import Card from "../models/Card.js";
import User from "../models/User.js";
import mongoose from "mongoose";


// ✅ CREATE CARD
export const createCard = async (req, res) => {
  try {
    const { title, listId } = req.body;

    if (!title || !listId) {
      return res.status(400).json({
        message: "Title and listId are required",
      });
    }

    const lastCard = await Card.find({ list: listId })
      .sort({ order: -1 })
      .limit(1);

    const order = lastCard.length ? lastCard[0].order + 1 : 1;

    const card = await Card.create({
      title,
      list: listId,
      order,
    });

    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




export const getFilteredCards = async (req, res) => {
  try {
    const { listId } = req.params;

    const {
      labels,
      members,
      isCompleted,
      dueDate,
    } = req.query;

    const query = {
      list: listId,
      isArchived: false,
    };

    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === "true";
    }

    if (labels) {
      const labelArray = labels.split(","); 
      query["labels.name"] = { $in: labelArray };
    }

    if (members) {
      const emails = members.split(",");

      const users = await User.find({
        email: { $in: emails },
      }).select("_id");

      const userIds = users.map((u) => u._id);

      query.members = { $in: userIds };
    }

    if (dueDate) {
      const date = new Date(dueDate);

      query.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    const cards = await Card.find(query)
      .populate("members", "email name")
      .sort({ order: 1 });

    res.json(cards);

  } catch (err) {
    console.error("Filter Cards Error:", err);

    res.status(500).json({
      message: "Failed to fetch filtered cards",
      error: err.message,
    });
  }
};


export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ VALIDATE ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid card ID",
      });
    }

    const updates = {};

    // ✅ TITLE
    if (req.body.title !== undefined) {
      const title = req.body.title?.trim();
      if (!title) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }
      updates.title = title;
    }

    // ✅ DESCRIPTION
    if (req.body.description !== undefined) {
      updates.description = req.body.description?.trim() || "";
    }

    // ✅ DUE DATE (SAFE HANDLING)
    if (req.body.dueDate !== undefined) {
      if (!req.body.dueDate) {
        updates.dueDate = null; // allow clearing date
      } else {
        const date = new Date(req.body.dueDate);
        if (!isNaN(date.getTime())) {
          updates.dueDate = date;
        }
      }
    }

    // ✅ LABELS
    if (req.body.labels !== undefined) {
      if (Array.isArray(req.body.labels)) {
        updates.labels = req.body.labels.map((label) => ({
          name: label?.name?.trim() || "Label",
          color: label?.color || "#7c3aed",
        }));
      }
    }

    // ✅ MEMBERS (EMAIL → USER ID)
    if (req.body.members !== undefined) {
      if (Array.isArray(req.body.members) && req.body.members.length > 0) {
        const users = await User.find({
          email: { $in: req.body.members },
        }).select("_id");

        updates.members = users.map((u) => u._id);
      } else {
        updates.members = []; // allow clearing members
      }
    }

    // ✅ ATTACHMENTS
    if (req.body.attachments !== undefined) {
      if (Array.isArray(req.body.attachments)) {
        updates.attachments = req.body.attachments.map((a) => ({
          fileName: a?.fileName || "file",
          fileUrl: a?.fileUrl,
          uploadedAt: a?.uploadedAt || new Date(),
        }));
      }
    }

    // ✅ STATUS
    if (req.body.isCompleted !== undefined) {
      updates.isCompleted = Boolean(req.body.isCompleted);
    }

    // 🔥 NO UPDATE CASE
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    // ✅ UPDATE
    const card = await Card.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("members", "email name");

    if (!card) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    res.json(card);

  } catch (err) {
    console.error("Update Card Error:", err);

    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};



// ✅ ARCHIVE CARD
export const archiveCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ MOVE CARD (FIXED 🔥)
export const moveCard = async (req, res) => {
  try {
    const { sourceListId, destinationListId, sourceIndex, destinationIndex } =
      req.body;

    const cardId = req.params.id;

    // ✅ Ensure correct card
    const movedCard = await Card.findById(cardId);
    if (!movedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    // STEP 1: Get source cards
    const sourceCards = await Card.find({
      list: sourceListId,
      isArchived: false,
    }).sort({ order: 1 });

    // Remove card from source
    const updatedSource = sourceCards.filter(
      (c) => c._id.toString() !== cardId
    );

    // SAME LIST (reorder)
    if (sourceListId === destinationListId) {
      updatedSource.splice(destinationIndex, 0, movedCard);

      await Promise.all(
        updatedSource.map((card, index) =>
          Card.findByIdAndUpdate(card._id, { order: index + 1 })
        )
      );

      return res.json({ message: "Card reordered" });
    }

    // DIFFERENT LIST

    // STEP 2: Destination cards
    const destinationCards = await Card.find({
      list: destinationListId,
      isArchived: false,
    }).sort({ order: 1 });

    destinationCards.splice(destinationIndex, 0, movedCard);

    // Update moved card's list
    movedCard.list = destinationListId;
    await movedCard.save();

    // Update destination orders
    await Promise.all(
      destinationCards.map((card, index) =>
        Card.findByIdAndUpdate(card._id, { order: index + 1 })
      )
    );

    
    await Promise.all(
      updatedSource.map((card, index) =>
        Card.findByIdAndUpdate(card._id, { order: index + 1 })
      )
    );

    res.json({ message: "Card moved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCardsByList = async (req, res) => {
  try {
    const { listId } = req.params;

    const cards = await Card.find({
      list: listId,
      isArchived: false,
    })
      .sort({ order: 1 })
      .populate("members", "name email");

    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAttachment = async (req, res) => {
  try {
    const { fileName, fileUrl } = req.body;

    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    card.attachments.push({
      fileName,
      fileUrl,
    });

    await card.save();

    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleCardComplete = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    card.isCompleted = !card.isCompleted;

    await card.save();

    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.id);

    res.json({ message: "Card deleted permanently" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const searchCards = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const cards = await Card.find({
      title: { $regex: query, $options: "i" },
      isArchived: false,
    })
      .populate({
        path: "list",
        select: "title board",
        populate: {
          path: "board",
          select: "title",
        },
      })
      .limit(10); // 🔥 limit for performance

    const results = cards.map((card) => ({
      _id: card._id,
      title: card.title,
      listName: card.list?.title,
      boardName: card.list?.board?.title,
      card, // full card for modal
    }));

    res.json(results);

  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};