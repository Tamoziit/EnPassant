class AudioManager {
    move = new Audio("/sounds/Move.mp3");
    capture = new Audio("/sounds/Capture.mp3");
    check = new Audio("/sounds/Check.mp3");
    castle = new Audio("/sounds/Castle.mp3");
    gameOver = new Audio("/sounds/GameOver.mp3");

    constructor() {
        this.move.load();
        this.capture.load();
        this.check.load();
        this.castle.load();
        this.gameOver.load();
    }

    playMove() {
        this.move.currentTime = 0;
        this.move.play().catch(() => { });
    }

    playCapture() {
        this.capture.currentTime = 0;
        this.capture.play().catch(() => { });
    }

    playCheck() {
        this.check.currentTime = 0;
        this.check.play().catch(() => { });
    }

    playCastle() {
        this.castle.currentTime = 0;
        this.castle.play().catch(() => { });
    }

    playGameOver() {
        this.gameOver.currentTime = 0;
        this.gameOver.play().catch(() => { });
    }
}

export const audioManager = new AudioManager();
