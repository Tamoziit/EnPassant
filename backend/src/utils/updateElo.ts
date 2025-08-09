function updateElo(
    ratingA: number,
    ratingB: number,
    scoreA: number,
    k: number
) {
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 - expectedA;

    let newRatingA = ratingA + k * (scoreA - expectedA);
    let newRatingB = ratingB + k * ((1 - scoreA) - expectedB);

    // Prevent ratings from going below 100
    newRatingA = Math.max(100, Math.round(newRatingA));
    newRatingB = Math.max(100, Math.round(newRatingB));

    return { newRatingA, newRatingB };
}

export default updateElo;
