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

export interface PlayerData {
    userId: string;
    username: string;
    elo: number;
    nationality: string;
    color: "w" | "b";
    profilePic?: string | null;
    gender: "M" | "F";
}

export interface RoomData {
    roomId: string;
    player1: PlayerData;
    player2: PlayerData;
    fen: string;
    moves: string[];
    status: string;
}