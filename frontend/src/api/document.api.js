const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const request = async (path, accessToken, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...options.headers,
        },
        ...options,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");

    return data;
};

export const listDocuments = (accessToken) =>
    request("/documents", accessToken);

export const createDocument = (accessToken) =>
    request("/documents", accessToken, { method: "POST" });

export const getDocument = (accessToken, id) =>
    request(`/documents/${id}`, accessToken);

export const updateDocument = (accessToken, id, data) =>
    request(`/documents/${id}`, accessToken, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
