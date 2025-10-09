const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Showing tenths of seconds when under 10 seconds
    if (totalSeconds < 10) {
        const tenths = Math.floor((ms % 1000) / 100);
        return `${seconds}.${tenths}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default formatTime;