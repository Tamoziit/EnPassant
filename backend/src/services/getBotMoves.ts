import { spawn } from "child_process";
import path from "path";

type BotMoveResult = {
  from: string;
  to: string;
  promotion?: string | null;
};

export const getBot1Move = (fen: string): Promise<BotMoveResult> => {
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
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name MultiPV value 1\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go depth 25\n");
      engine.stdin.write("go movetime 2000\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};

export const getBot2Move = (fen: string): Promise<BotMoveResult> => {
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
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name MultiPV value 1\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go depth 20\n");
      engine.stdin.write("go movetime 2000\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};

export const getBot3Move = (fen: string): Promise<BotMoveResult> => {
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
    }, 10000);

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

export const getBot4Move = (fen: string): Promise<BotMoveResult> => {
  return new Promise((resolve, reject) => {
    const enginePath = path.resolve(
      __dirname,
      "../engine/stockfish-windows-x86-64-avx2.exe"
    );
    const engine = spawn(enginePath);

    let resolved = false;
    let pvLines: string[] = [];

    const handleData = (data: Buffer) => {
      const lines = data.toString().split("\n");

      for (const line of lines) {
        // Collecting candidate moves from MultiPV output
        if (line.includes("multipv")) {
          pvLines.push(line.trim());
        }

        // When Stockfish gives final bestmove line
        if (line.startsWith("bestmove")) {
          if (pvLines.length >= 2) {
            // Picking 2nd-best move
            const line = pvLines.find((l) => l.includes("multipv 2"));
            if (line) {
              const match = line.match(/ pv\s+(\S+)/);
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

          // fallback — no multipv found, just use bestmove
          const match = line.match(/^bestmove\s+(\S+)/);
          if (match) {
            const move = match[1];
            const from = move.slice(0, 2);
            const to = move.slice(2, 4);
            const promotion = move.length > 4 ? move[4].toUpperCase() : null;

            resolved = true;
            engine.kill();
            engine.stdout.removeAllListeners();
            resolve({ from, to, promotion });
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
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name MultiPV value 2\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go depth 15\n");
      engine.stdin.write("go movetime 2000\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};

export const getBot5Move = (fen: string): Promise<BotMoveResult> => {
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
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name MultiPV value 1\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go depth 10\n");
      engine.stdin.write("go movetime 2000\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};

export const getBot6Move = (fen: string): Promise<BotMoveResult> => {
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
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name MultiPV value 1\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go depth 20\n");
      engine.stdin.write("go movetime 1000\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};

export const getBot7Move = (fen: string): Promise<BotMoveResult> => {
  return new Promise((resolve, reject) => {
    const enginePath = path.resolve(
      __dirname,
      "../engine/stockfish-windows-x86-64-avx2.exe"
    );
    const engine = spawn(enginePath);

    let resolved = false;
    let pvLines: string[] = [];

    const handleData = (data: Buffer) => {
      const lines = data.toString().split("\n");

      for (const line of lines) {
        if (line.includes("multipv")) {
          pvLines.push(line.trim());
        }

        if (line.startsWith("bestmove")) {
          const chooseMove = (n: number): string | null => {
            const pvLine = pvLines.find((l) => l.includes(`multipv ${n}`));
            if (!pvLine) return null;
            const match = pvLine.match(/ pv\s+(\S+)/);
            return match ? match[1] : null;
          };

          let move = chooseMove(3) || chooseMove(2); // fallback to 2nd-best
          if (!move) {
            // finally fallback to best move
            const match = line.match(/^bestmove\s+(\S+)/);
            move = match ? match[1] : null;
          }

          if (move) {
            const from = move.slice(0, 2);
            const to = move.slice(2, 4);
            const promotion = move.length > 4 ? move[4].toUpperCase() : null;

            resolved = true;
            engine.kill();
            engine.stdout.removeAllListeners();
            resolve({ from, to, promotion });
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
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name MultiPV value 3\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go depth 10\n");
      engine.stdin.write("go movetime 1000\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};

export const getBot8Move = (fen: string): Promise<BotMoveResult> => {
  return new Promise((resolve, reject) => {
    const enginePath = path.resolve(
      __dirname,
      "../engine/stockfish-windows-x86-64-avx2.exe"
    );
    const engine = spawn(enginePath);

    let resolved = false;
    let pvLines: string[] = [];

    const handleData = (data: Buffer) => {
      const lines = data.toString().split("\n");

      for (const line of lines) {
        if (line.includes("multipv")) {
          pvLines.push(line.trim());
        }

        if (line.startsWith("bestmove")) {
          if (pvLines.length >= 3) {
            // Picking 3rd-best move
            const line = pvLines.find((l) => l.includes("multipv 3"));
            if (line) {
              const match = line.match(/ pv\s+(\S+)/);
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

          const match = line.match(/^bestmove\s+(\S+)/);
          if (match) {
            const move = match[1];
            const from = move.slice(0, 2);
            const to = move.slice(2, 4);
            const promotion = move.length > 4 ? move[4].toUpperCase() : null;

            resolved = true;
            engine.kill();
            engine.stdout.removeAllListeners();
            resolve({ from, to, promotion });
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
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name MultiPV value 3\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go depth 10\n");
      engine.stdin.write("go movetime 1000\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};

export const getBot9Move = (fen: string): Promise<BotMoveResult> => {
  return new Promise((resolve, reject) => {
    const enginePath = path.resolve(
      __dirname,
      "../engine/stockfish-windows-x86-64-avx2.exe"
    );
    const engine = spawn(enginePath);

    let resolved = false;
    let pvLines: string[] = [];

    const handleData = (data: Buffer) => {
      const lines = data.toString().split("\n");

      for (const line of lines) {
        if (line.includes("multipv")) {
          pvLines.push(line.trim());
        }

        if (line.startsWith("bestmove")) {
          if (pvLines.length >= 2) {
            const line = pvLines.find((l) => l.includes("multipv 2"));
            if (line) {
              const match = line.match(/ pv\s+(\S+)/);
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

          const match = line.match(/^bestmove\s+(\S+)/);
          if (match) {
            const move = match[1];
            const from = move.slice(0, 2);
            const to = move.slice(2, 4);
            const promotion = move.length > 4 ? move[4].toUpperCase() : null;

            resolved = true;
            engine.kill();
            engine.stdout.removeAllListeners();
            resolve({ from, to, promotion });
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
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name MultiPV value 2\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go depth 10\n");
      engine.stdin.write("go movetime 2000\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};

export const getBot10Move = (fen: string): Promise<BotMoveResult> => {
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
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name UCI_LimitStrength value true\n");
      engine.stdin.write("setoption name UCI_Elo value 1700\n");
      engine.stdin.write("setoption name MultiPV value 1\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go movetime 1500\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};

export const getBot11Move = (fen: string): Promise<BotMoveResult> => {
  return new Promise((resolve, reject) => {
    const enginePath = path.resolve(
      __dirname,
      "../engine/stockfish-windows-x86-64-avx2.exe"
    );
    const engine = spawn(enginePath);

    let resolved = false;
    let pvLines: string[] = [];

    const handleData = (data: Buffer) => {
      const lines = data.toString().split("\n");

      for (const line of lines) {
        if (line.includes("multipv")) {
          pvLines.push(line.trim());
        }

        if (line.startsWith("bestmove")) {
          if (pvLines.length >= 2) {
            const secondLine = pvLines.find((l) => l.includes("multipv 2"));
            if (secondLine) {
              const match = secondLine.match(/ pv\s+(\S+)/);
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

          const match = line.match(/^bestmove\s+(\S+)/);
          if (match) {
            const move = match[1];
            const from = move.slice(0, 2);
            const to = move.slice(2, 4);
            const promotion = move.length > 4 ? move[4].toUpperCase() : null;

            resolved = true;
            engine.kill();
            engine.stdout.removeAllListeners();
            resolve({ from, to, promotion });
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
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    setTimeout(() => {
      engine.stdin.write("setoption name UCI_LimitStrength value true\n");
      engine.stdin.write("setoption name UCI_Elo value 1700\n");
      engine.stdin.write("setoption name MultiPV value 2\n");
      engine.stdin.write("ucinewgame\n");
      engine.stdin.write(`position fen ${fen}\n`);
      engine.stdin.write("go movetime 1500\n");
    }, 200);

    engine.on("exit", () => clearTimeout(timeout));
  });
};