import express from "express";
import {
  createCard,
  updateCard,
  archiveCard,
  moveCard,
  getCardsByList,
  addAttachment,
  toggleCardComplete,
  deleteCard,
  getFilteredCards,
  searchCards,
} from "../controllers/card.controller.js";

const router = express.Router();


router.post("/", createCard);

router.put("/:id", updateCard);


router.delete("/:id", deleteCard);              // permanent delete
router.patch("/:id/archive", archiveCard);
// routes/card.routes.js

router.get("/search", searchCards);

router.patch("/:id/move", moveCard);

router.get("/list/:listId", getCardsByList);

router.post("/:id/attachment", addAttachment);

router.patch("/:id/toggle-complete", toggleCardComplete);

router.get("/list/:listId/filter", getFilteredCards);
export default router;