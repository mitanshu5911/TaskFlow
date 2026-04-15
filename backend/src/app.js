import express from "express";
import cors from "cors";

import boardRoutes from "./routes/board.routes.js";
import listRoutes from "./routes/list.routes.js";
import cardRoutes from "./routes/card.routes.js";

const app = express();
const url = process.env.FRONTEND_URL
app.use(cors({
origin: url,
  credentials: true
}));

app.use(express.json());

app.use("/api/boards", boardRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/cards", cardRoutes);

export default app;