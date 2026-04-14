import api from "../utils/api";

export const getListsByBoard = async (boardId) => {
  const res = await api.get(`/lists/board/${boardId}`);
  return res.data;
};


export const createList = async (data) => {
  const res = await api.post("/lists", data);
  return res.data;
};

export const updateList = async (id, data) => {
  const res = await api.put(`/lists/${id}`, data);
  return res.data;
};


export const deleteList = async (id) => {
  const res = await api.delete(`/lists/${id}`);
  return res.data;
};