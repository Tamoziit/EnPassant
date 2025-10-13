import { Chess } from "chess.js";

const getResult = (chess: Chess) => {
    const result = {
        status: "ongoing",
        gameEnded: false,
        message: ""
    }

    if (chess.isCheckmate()) {
        result.status = "checkmate";
        result.gameEnded = true;
    } else if (chess.isStalemate()) {
        result.status = "stalemate";
        result.gameEnded = true;
    } else if (chess.isThreefoldRepetition()) {
        result.status = "draw";
        result.message = "by 3-fold move repetition"
        result.gameEnded = true;
    } else if (chess.isDrawByFiftyMoves()) {
        result.status = "draw";
        result.message = "by 50 move rule"
        result.gameEnded = true;
    } else if (chess.isInsufficientMaterial()) {
        result.status = "draw";
        result.message = "by insufficient Checkmating material"
        result.gameEnded = true;
    } else {
        result.status = "ongoing";
    }

    return result;
}

export default getResult;