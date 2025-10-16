class AudioManager {
    move = new Audio("/sounds/Move.mp3");
    // capture = new Audio("/sounds/Capture.mp3");
    // check = new Audio("/sounds/Check.mp3");

    constructor() {
        this.move.load();
        // this.capture.load();
        // this.check.load();
    }

    playMove() {
        this.move.currentTime = 0;
        this.move.play().catch(() => { });
    }

    // playCapture() {
    //     this.capture.currentTime = 0;
    //     this.capture.play().catch(() => { });
    // }

    // playCheck() {
    //     this.check.currentTime = 0;
    //     this.check.play().catch(() => { });
    // }
}

export const audioManager = new AudioManager();
