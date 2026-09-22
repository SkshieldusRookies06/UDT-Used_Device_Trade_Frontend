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

<<<<<<< HEAD
export const downloadDisputeFile = async (disputeId, fileId, filename) => {
  const blob = await client.get(`/api/disputes/${disputeId}/files/${fileId}`, { responseType: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
=======
export const disputeFileUrl = (disputeId, fileId) =>
  `${import.meta.env.VITE_API_URL}/api/disputes/${disputeId}/files/${fileId}`;

export const fetchMyProducts = (params) => client.get("/api/me/products", { params });
export const fetchMyWishes = (params) => client.get("/api/me/wishes", { params });
>>>>>>> f8370d6 (T-016 — 마이페이지 4탭 구현)
