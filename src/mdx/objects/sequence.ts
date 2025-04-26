import { BinaryStream, decode } from "hexcod";
import { UnrecognizedValueError } from "../errors";
import { parseExtent, type Extent } from "../shared/extent";

type Sequence = {
    name: string;
    interval: Uint32Array;
    moveSpeed: number;
    loop: boolean;
    rarity: number;
    syncPoint: number;
    extent: Extent;
};

function booleanifyLoop(loop: number, currentOffset: number): boolean {
    switch (loop) {
        case 0:
            return true;
        case 1:
            return false;
        default:
            throw new UnrecognizedValueError(currentOffset - 4, "Sequence", "loop", loop, "0 = true, 1 = false");
    }
}

function parseSequence(stream: BinaryStream): Sequence {
    const sequence = {} as Sequence;

    // Read sequence fields
    sequence.name = decode(stream.read("u8", 80));
    sequence.interval = stream.read("u32", 2);
    sequence.moveSpeed = stream.read("f32");
    sequence.loop = booleanifyLoop(stream.read("u32"), stream.offset);
    sequence.rarity = stream.read("f32");
    sequence.syncPoint = stream.read("u32");
    sequence.extent = parseExtent(stream);

    return sequence;
}

export { parseSequence, type Sequence };
