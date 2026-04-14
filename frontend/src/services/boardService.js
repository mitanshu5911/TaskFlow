import api from "../utils/api";

export const createBoard = async (data) => {
    const res = await api.post("/boards", data);
    return res.data;
};

export const getBoards = async () => {
  const res = await api.get("/boards");
  return res.data;
};