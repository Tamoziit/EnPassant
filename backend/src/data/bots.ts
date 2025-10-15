import { getBot10Move, getBot11Move, getBot1Move, getBot2Move, getBot3Move, getBot4Move, getBot5Move, getBot6Move, getBot7Move, getBot8Move, getBot9Move } from "../services/getBotMoves";

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
    },
    {
        id: "EP:BOT-6",
        moveFunction: getBot6Move
    },
    {
        id: "EP:BOT-7",
        moveFunction: getBot7Move
    },
    {
        id: "EP:BOT-8",
        moveFunction: getBot8Move
    },
    {
        id: "EP:BOT-9",
        moveFunction: getBot9Move
    },
    {
        id: "EP:BOT-10",
        moveFunction: getBot10Move
    },
    {
        id: "EP:BOT-11",
        moveFunction: getBot11Move
    }
];