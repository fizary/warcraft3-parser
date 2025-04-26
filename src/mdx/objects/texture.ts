import { BinaryStream, decode } from "hexcod";
import { UnrecognizedValueError } from "../errors";

type Texture = {
    replaceableId: number;
    fileName: string;
    wrap: "none" | "both" | "horizontal" | "vertical";
};

function stringifyWrap(wrap: number, currentOffset: number): Texture["wrap"] {
    switch (wrap) {
        case 0:
            return "none";
        case 1:
            return "horizontal";
        case 2:
            return "vertical";
        case 3:
            return "both";
        default:
            throw new UnrecognizedValueError(currentOffset - 4, "Texture", "wrap", wrap, "0 = none, 1 = horizontal, 2 = vertical, 3 = both");
    }
}

function parseTexture(stream: BinaryStream): Texture {
    const texture = {} as Texture;

    // Read texture fields
    texture.replaceableId = stream.read("u32");
    texture.fileName = decode(stream.read("u8", 260));
    texture.wrap = stringifyWrap(stream.read("u32"), stream.offset);

    return texture;
}

export { parseTexture, type Texture };
