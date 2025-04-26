import { BinaryStream } from "hexcod";
import { UnrecognizedValueError } from "../errors";

function parseInterpolationType(stream: BinaryStream) {
    const value = stream.read("u32");

    switch (value) {
        case 0:
            return "none";
        case 1:
            return "linear";
        case 2:
            return "hermite";
        case 3:
            return "bezier";
        default:
            throw new UnrecognizedValueError(stream.offset - 4, "Track", "interpolationType", value, "0 = none, 1 = linear, 2 = hermite, 3 = bezier");
    }
}

export { parseInterpolationType };
