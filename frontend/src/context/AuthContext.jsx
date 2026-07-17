import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth.api.js";

const AuthContext = createContext(null);

const saved = () => ({
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    user: JSON.parse(localStorage.getItem("user") || "null"),
});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(saved);

    const saveAuth = (data) => {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        setAuth(data);
    };

    const signIn = async (email, password) => saveAuth(await authApi.login({ email, password }));

    const signUp = async (name, email, password) =>
        saveAuth(await authApi.register({ name, email, password }));

    const signOut = async () => {
        await authApi.logout(auth.refreshToken);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setAuth({ accessToken: null, refreshToken: null, user: null });
    };

    useEffect(() => {
        if (!auth.accessToken) return;

        authApi.getMe(auth.accessToken).catch(async () => {
            if (!auth.refreshToken) return signOut();
            const data = await authApi.refresh(auth.refreshToken);
            localStorage.setItem("accessToken", data.accessToken);
            setAuth((current) => ({ ...current, accessToken: data.accessToken }));
        });
    }, []);

    const value = useMemo(
        () => ({ ...auth, signIn, signUp, signOut }),
        [auth],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
