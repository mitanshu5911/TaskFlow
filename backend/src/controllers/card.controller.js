import Card from "../models/Card.js";


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



// ✅ UPDATE CARD
export const updateCard = async (req, res) => {
  try {
    const allowedUpdates = [
      "title",
      "description",
      "labels",
      "members",
      "dueDate",
      "checklist",
    ];

    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const card = await Card.findByIdAndUpdate(
      req.params.id,
      updates,
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

    // Update source orders
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