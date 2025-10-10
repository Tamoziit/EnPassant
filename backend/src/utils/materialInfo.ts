import { Chess, PieceSymbol } from "chess.js";

const pieceValues: Record<PieceSymbol, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
};

function getMaterialInfo(chess: Chess) {
    const board = chess.board();

    const counts: Record<"w" | "b", Record<PieceSymbol, number>> = {
        w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
        b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    for (const row of board) {
        for (const square of row) {
            if (!square) continue;
            counts[square.color][square.type]++;
        }
    }

    // Initial counts excluding king (since kings are never captured)
    const startingCounts: Record<Exclude<PieceSymbol, "k">, number> = {
        p: 8,
        n: 2,
        b: 2,
        r: 2,
        q: 1,
    };

    const capturedByWhite: Record<Exclude<PieceSymbol, "k">, number> = {
        p: 0,
        n: 0,
        b: 0,
        r: 0,
        q: 0,
    };

    const capturedByBlack: Record<Exclude<PieceSymbol, "k">, number> = {
        p: 0,
        n: 0,
        b: 0,
        r: 0,
        q: 0,
    };

    for (const [piece, startCount] of Object.entries(startingCounts) as [Exclude<PieceSymbol, "k">, number][]) {
        capturedByWhite[piece] = startCount - counts.b[piece];
        capturedByBlack[piece] = startCount - counts.w[piece];
    }

    const whiteScore = (Object.entries(counts.w) as [PieceSymbol, number][])
        .reduce((sum, [p, c]) => sum + pieceValues[p] * c, 0);

    const blackScore = (Object.entries(counts.b) as [PieceSymbol, number][])
        .reduce((sum, [p, c]) => sum + pieceValues[p] * c, 0);

    return {
        capturedByWhite,
        capturedByBlack,
        materialAdvantage: whiteScore - blackScore,
    };
}

export default getMaterialInfo;