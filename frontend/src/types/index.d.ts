export interface SignupParams {
    fullName: string;
    username: string;
    email: string;
    password: string;
    gender: string;
    nationality: string;
}

export interface LoginParams {
    email: string;
    password: string;
}

export interface AuthUser {
    _id: string;
    fullName: string;
    username: string;
    email: string;
    gender: "M" | "F" | "O";
    profilePic?: string | null;
    nationality: string;
}

export interface AuthContextType {
    authUser: AuthUser | null;
    setAuthUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

export interface AuthContextProviderProps {
    children: ReactNode;
}

export interface SocketContextType {
    socket: Socket | null;
    onlinePlayers: string[];
}

export interface SocketProviderProps {
    children: ReactNode;
}