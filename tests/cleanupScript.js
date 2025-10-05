const fs = require("fs");

// Read all 5 JSON files
const files = ["ecoA.json", "ecoB.json", "ecoC.json", "ecoD.json", "ecoE.json"];

let openings = [];

for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));

    for (const [fen, obj] of Object.entries(data)) {
        openings.push({
            fen,
            eco: obj.eco || "",
            name: obj.name || "",
            moves: obj.moves || "",
        });
    }
}

// Optionally remove duplicates (by FEN)
openings = openings.filter(
    (v, i, a) => a.findIndex(t => t.fen === v.fen) === i
);

// Save to new file
fs.writeFileSync("openings2.json", JSON.stringify(openings, null, 2));

console.log(`✅ Merged ${openings.length} openings into openings.json`);
