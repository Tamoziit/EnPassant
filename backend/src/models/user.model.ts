import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        min: 2,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        min: 6,
        required: true
    },
    profilePic: {
        type: String
    },
    gender: {
        type: String,
        enum: ["M", "F", "O"],
        required: true
    },
    elo: {
        type: Number,
        default: 200,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    gameStats: {
        played: {
            type: Number,
            default: 0,
            required: true
        },
        won: {
            type: Number,
            default: 0,
            required: true
        },
        lost: {
            type: Number,
            default: 0,
            required: true
        },
        draw: {
            type: Number,
            default: 0,
            required: true
        },
        stalemate: {
            type: Number,
            default: 0,
            required: true
        }
    }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
export default User;