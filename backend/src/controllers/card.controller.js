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

    // 🔥 VALIDATE CARD ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid card ID",
      });
    }

    const allowedUpdates = [
      "title",
      "description",
      "labels",
      "members",
      "dueDate",
      "attachments",
      "isCompleted",
    ];

    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }
      updates.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      updates.description = updates.description.trim();
    }

    if (updates.dueDate !== undefined) {
      const date = new Date(updates.dueDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          message: "Invalid due date",
        });
      }
      updates.dueDate = date;
    }

    if (updates.labels !== undefined) {
      if (!Array.isArray(updates.labels)) {
        return res.status(400).json({
          message: "Labels must be an array",
        });
      }

      updates.labels = updates.labels.map((label) => ({
        name: label.name?.trim() || "Label",
        color: label.color || "#7c3aed",
      }));
    }

    if (updates.members !== undefined) {
      if (!Array.isArray(updates.members)) {
        return res.status(400).json({
          message: "Members must be an array",
        });
      }

      const users = await User.find({
        email: { $in: updates.members },
      }).select("_id email");

      const userIds = users.map((u) => u._id);

      updates.members = [...new Set(userIds)]; 
    }

    if (updates.attachments !== undefined) {
      if (!Array.isArray(updates.attachments)) {
        return res.status(400).json({
          message: "Attachments must be an array",
        });
      }

      updates.attachments = updates.attachments.map((a) => ({
        fileName: a.fileName || "file",
        fileUrl: a.fileUrl,
        uploadedAt: a.uploadedAt || new Date(),
      }));
    }

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