import { spawn } from "child_process"; 
import path from "path"; 
 
type EvalResult = number | string; 
 
const evaluateFEN = (fen: string): Promise<EvalResult> => { 
    return new Promise((resolve, reject) => { 
        const enginePath = path.resolve(__dirname, "../engine/stockfish-windows-x86-64-avx2.exe"); 
        const engine = spawn(enginePath); 
 
        let resolved = false;
        let latestScore: EvalResult | null = null;
        let isWhiteToMove = !fen.includes(' b ');
 
        const handleData = (data: Buffer) => { 
            const lines = data.toString().split("\n"); 
 
            for (const line of lines) {
                if (line.startsWith("bestmove")) {
                    if (!resolved && latestScore !== null) {
                        resolved = true;
                        engine.kill();
                        engine.stdout.removeAllListeners();
                        
                        let finalScore = latestScore;
                        if (typeof finalScore === 'number' && !isWhiteToMove) {
                            finalScore = -finalScore;
                        }
                        
                        resolve(finalScore);
                    }
                    break;
                }
                
                if (line.includes("score")) { 
                    const match = line.match(/score (cp|mate) (-?\d+)/); 
                    if (match) { 
                        const [, type, val] = match; 
                        const value = parseInt(val, 10); 
 
                        latestScore = type === "cp" 
                            ? value / 100 
                            : `Mate in ${Math.abs(value)}`;
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
                reject("Engine analysis timeout");
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
        }, 100);

        engine.on('exit', () => {
            clearTimeout(timeout);
        });
    }); 
}; 
 
export default evaluateFEN;