import { createContext, useContext, useEffect, useState, } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "./AuthContext";
import type { SocketContextType, SocketProviderProps } from "@/types";

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocketContext must be used within a SocketContextProvider");
    }
    return context;
};

export const SocketContextProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const { authUser } = useAuthContext()
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlinePlayers, setOnlinePlayers] = useState<string[]>([]);

    useEffect(() => {
        if (authUser) {
            const newSocket = io("http://localhost:5000", {
                query: {
                    userId: authUser._id,
                },
            });

            setSocket(newSocket);

            newSocket.on("activeRooms", (users: string[]) => {
                setOnlinePlayers(users);
            });

            return () => {
                newSocket.close();
                setSocket(null);
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser]);

    return (
        <SocketContext.Provider value={{ socket, onlinePlayers }}>
            {children}
        </SocketContext.Provider>
    );
};