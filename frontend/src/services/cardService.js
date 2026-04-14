import api from "../utils/api";

export const createCard = async (data) => {
  const res = await api.post("/cards", data);
  return res.data;
};

export const getCardsByList = async (listId) => {
  const res = await api.get(`/cards/list/${listId}`);
  return res.data;
};