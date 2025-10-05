import { openings } from "@/data/openings";

function getOpeningByFEN(fen: string): string {
    const opening = openings.find(o => o.fen === fen);

    if (opening) {
        return `${opening.eco}: ${opening.name}`;
    } else {
        return "";
    }
}

export default getOpeningByFEN;