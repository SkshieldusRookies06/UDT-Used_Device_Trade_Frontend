import client from "./client.js";

export const signup = (payload) => client.post("/api/auth/signup", payload);
export const login = (payload) => client.post("/api/auth/login", payload);
export const fetchMe = () => client.get("/api/me");
