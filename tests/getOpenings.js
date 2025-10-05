import { openings } from "../frontend/src/data/openings.ts"

function getOpeningByFEN(fen) {
    // Exact match
    const opening = openings.find(o => o.fen === fen);

    if (opening) {
        return opening;
    } else {
        return null; // or throw an error, or return a default value
    }
}

const testFENs = [
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", // King's Pawn
    "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", // Sicilian
    "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3", // Italian
    "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3", // Ruy Lopez
    "rnbqkb1r/pppppp1p/5np1/8/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 1 3", // London
    "rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq - 0 2" // Reti
];

// Run tests
testFENs.forEach(fen => {
    const result = getOpeningByFEN(fen);
    if (result) {
        console.log(`FEN: ${fen}`);
        console.log(`Opening: ${result.name}, ECO: ${result.eco}`);
        console.log('----------------------------------------');
    } else {
        console.log(`FEN: ${fen} → Opening not found`);
    }
});

console.log(openings.length)