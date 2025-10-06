import { spawn } from "child_process";
import path from "path";

type BestMoveResult = {
  from: string;
  to: string;
  promotion?: string | null;
};

const getBestMove = (fen: string): Promise<BestMoveResult> => {
  return new Promise((resolve, reject) => {
    const enginePath = path.resolve(
      __dirname,
      "../engine/stockfish-windows-x86-64-avx2.exe"
    );
    const engine = spawn(enginePath);

    let resolved = false;

    const handleData = (data: Buffer) => {
      const lines = data.toString().split("\n");

      for (const line of lines) {
        if (line.startsWith("bestmove")) {
          const match = line.match(/^bestmove\s+(\S+)/);
          if (match) {
            const move = match[1];
            const from = move.slice(0, 2);
            const to = move.slice(2, 4);
            const promotion =
              move.length > 4 ? move[4].toUpperCase() : null;

            resolved = true;
            engine.kill();
            engine.stdout.removeAllListeners();

            resolve({ from, to, promotion });
            return;
          }
        }
      }
    };

    engine.stdout.on("data", handleData);

    engine.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        reject(`Failed to start Stockfish engine: ${err}`);
      }
    });

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        engine.kill();
        reject("Engine timeout while finding best move");
      }
    }, 5000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name MultiPV value 1\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go depth 15\n");
      engine.stdin.write("go movetime 2000\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};

export default getBestMove;