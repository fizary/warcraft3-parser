import { BinaryStream, decode } from "hexcod";
import { parseExtent, type Extent } from "./extent.ts";

const enum SequenceLoop {
    Loop = 0,
    NoLoop = 1,
}

type Sequence = {
    name: string;
    interval: Uint32Array;
    moveSpeed: number;
    loop: number;
    rarity: number;
    syncPoint: number;
    extent: Extent;
}

function parseSequence(stream: BinaryStream): Sequence {
    const sequence = {} as Sequence;

    sequence.name = decode(stream.read("u8", 80));
    sequence.interval = stream.read("u32", 2);
    sequence.moveSpeed = stream.read("f32");
    sequence.loop = stream.read("u32");
    sequence.rarity = stream.read("f32");
    sequence.syncPoint = stream.read("u32");
    sequence.extent = parseExtent(stream);

    return sequence;
}

export { parseSequence, SequenceLoop, type Sequence };
