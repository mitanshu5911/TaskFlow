import express from "express";
import {
  createCard,
  updateCard,
  archiveCard,
  moveCard,
  getCardsByList,
} from "../controllers/card.controller.js";

const router = express.Router();


router.post("/", createCard);

router.put("/:id", updateCard);

router.delete("/:id", archiveCard);

router.patch("/:id/move", moveCard);

router.get("/list/:listId", getCardsByList);

export default router;