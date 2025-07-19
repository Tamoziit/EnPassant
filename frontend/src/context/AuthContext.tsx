/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";
import type { AuthContextProviderProps, AuthContextType, AuthUser } from "../types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthContextProvider");
    }
    return context;
};

const getStoredUser = (): AuthUser | null => {
    const expiry = localStorage.getItem("EP-expiry");
    const now = new Date().getTime();

    if (!expiry || now > parseInt(expiry)) {
        // Token Expired
        localStorage.removeItem("EP-user");
        localStorage.removeItem("EP-token");
        localStorage.removeItem("EP-expiry");
        return null;
    }

    const user = localStorage.getItem("EP-user");
    return user ? JSON.parse(user) : null;
};

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(getStoredUser());

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};