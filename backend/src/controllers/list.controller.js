import List from "../models/List.js";


export const createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;

    const lastList = await List.find({ board: boardId })
      .sort("-order")
      .limit(1);

    const order = lastList.length ? lastList[0].order + 1 : 1;

    const list = await List.create({
      title,
      board: boardId,
      order,
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateList = async (req, res) => {
  try {
    const list = await List.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title },
      { new: true }
    );

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteList = async (req, res) => {
  try {
    await List.findByIdAndDelete(req.params.id);
    res.json({ message: "List deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getListsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const lists = await List.find({ board: boardId })
      .sort({ order: 1 });

    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};