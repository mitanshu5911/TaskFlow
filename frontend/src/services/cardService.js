import api from "../utils/api";

export const createCard = async (data) => {
  const res = await api.post("/cards", data);
  return res.data;
};

export const getCardsByList = async (listId) => {
  const res = await api.get(`/cards/list/${listId}`);
  return res.data;
};

export const addAttachment = async (cardId, data) => {
  const res = await api.post(`/cards/${cardId}/attachment`, data);
  return res.data;
};

export const updateCard = async (id, data) => {
  const res = await api.put(`/cards/${id}`, data);
  return res.data;
};


export const toggleCardComplete = async (cardId) => {
  const res = await api.patch(`/cards/${cardId}/toggle-complete`);
  return res.data;
};

export const deleteCard = async (cardId) => {
  const res = await api.delete(`/cards/${cardId}`);
  return res.data;
};

export const archiveCard = async (cardId) => {
  const res = await api.patch(`/cards/${cardId}/archive`);
  return res.data;
};


export const getFilteredCards = async (listId, filters) => {
  const query = new URLSearchParams(filters).toString();

  const res = await api.get(`/cards/list/${listId}/filter?${query}`);

  return res.data;
};



export const searchCards = async (query) => {
  const res = await api.get(`/cards/search?query=${query}`);
  return res.data;
};