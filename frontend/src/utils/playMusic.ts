import { audioManager } from "./audioManager";

const playMusic = (move: string) => {
    if (move.includes("x") && move.includes("+")) {
        audioManager.playCheck();
    } else if (move.includes("x")) {
        audioManager.playCapture();
    } else if (move.includes("+")) {
        audioManager.playCheck();
    } else if (move.includes("O")) {
        audioManager.playCastle();
    } else {
        audioManager.playMove();
    }
}

export default playMusic;