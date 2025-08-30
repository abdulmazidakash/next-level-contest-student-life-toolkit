
import api from "./api";

export const getJwtToken = async (user) => {
  const { data } = await api.post("/jwt", user);
  return data?.token;
};

export const upsertUser = async (email, payload) => {
  const { data } = await api.post(`/users/${email}`, payload);
  return data;
};

