import client from "./client.js";

export const fetchProducts = (params) => client.get("/api/products", { params });
export const fetchProduct = (id) => client.get(`/api/products/${id}`);
export const fetchCategories = () => client.get("/api/categories");
export const addWish = (id) => client.post(`/api/products/${id}/wishes`);
export const removeWish = (id) => client.delete(`/api/products/${id}/wishes`);
export const fetchMyWishes = (params) => client.get("/api/me/wishes", { params });
export const fetchMyProducts = (params) => client.get("/api/me/products", { params });

export const createProduct = (product, images) => {
  const form = new FormData();
  form.append("product", new Blob([JSON.stringify(product)], { type: "application/json" }));
  images.forEach((file) => form.append("images", file));
  return client.post("/api/products", form);
};
