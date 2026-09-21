import client from "./client.js";

export const purchase = (productId) => client.post(`/api/products/${productId}/purchase`);
export const fetchTransaction = (id) => client.get(`/api/transactions/${id}`);
export const fetchMyTransactions = (params) => client.get("/api/me/transactions", { params });
export const registerShipping = (id, payload) => client.patch(`/api/transactions/${id}/shipping`, payload);
export const confirmTransaction = (id) => client.patch(`/api/transactions/${id}/confirm`);

export const openDispute = (id, reason, files) => {
  const form = new FormData();
  form.append("dispute", new Blob([JSON.stringify({ reason })], { type: "application/json" }));
  files.forEach((file) => form.append("files", file));
  return client.post(`/api/transactions/${id}/disputes`, form);
};

export const disputeFileUrl = (disputeId, fileId) =>
  `${import.meta.env.VITE_API_URL}/api/disputes/${disputeId}/files/${fileId}`;
