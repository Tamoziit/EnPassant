import { getBot1Move, getBot2Move, getBot3Move, getBot4Move, getBot5Move } from "../services/getBotMoves";

export const bots = [
    {
        id: "EP:BOT-1",
        moveFunction: getBot1Move
    },
    {
        id: "EP:BOT-2",
        moveFunction: getBot2Move
    },
    {
        id: "EP:BOT-3",
        moveFunction: getBot3Move
    },
    {
        id: "EP:BOT-4",
        moveFunction: getBot4Move
    },
    {
        id: "EP:BOT-5",
        moveFunction: getBot5Move
    }
];