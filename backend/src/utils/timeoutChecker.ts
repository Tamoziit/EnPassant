import { checkRoomTimeout } from "../controllers/game.controller";
import client from "../redis/client";

const startTimeoutChecker = () => {
    console.log("🕐 Starting timeout checker...");

    // Checking every second
    setInterval(async () => {
        try {
            // Getting all active game room IDs
            const activeRoomIds = await client.smembers("ACTIVE_GAMES");

            if (activeRoomIds.length > 0) {
                // Checking each room for timeout
                await Promise.all(
                    activeRoomIds.map(roomId => checkRoomTimeout(roomId))
                );
            }
        } catch (error) {
            console.error("Error in timeout checker:", error);
        }
    }, 1000); // Checking every 1 second
};

export default startTimeoutChecker;