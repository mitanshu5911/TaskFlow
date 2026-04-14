import express from "express";
import {
  createList,
  updateList,
  deleteList,
  getListsByBoard,
} from "../controllers/list.controller.js";

const router = express.Router();

router.post("/", createList);
router.put("/:id", updateList);
router.delete("/:id", deleteList);

router.get("/board/:boardId", getListsByBoard);

export default router;