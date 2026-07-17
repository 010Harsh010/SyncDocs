const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    });

    if (response.status === 204) return null;

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");

    return data;
};

export const register = (payload) =>
    request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
    });

export const login = (payload) =>
    request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });

export const refresh = (refreshToken) =>
    request("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
    });

export const logout = (refreshToken) =>
    request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
    });

export const getMe = (accessToken) =>
    request("/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
