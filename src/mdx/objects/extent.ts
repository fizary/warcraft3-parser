import { BinaryStream } from "hexcod";

type Extent = {
    boundsRadius: number;
    minimum: Float32Array;
    maximum: Float32Array;
}

function parseExtent(stream: BinaryStream): Extent {
    const extent = {} as Extent;

    extent.boundsRadius = stream.read("f32");
    extent.minimum = stream.read("f32", 3);
    extent.maximum = stream.read("f32", 3);

    return extent;
}

export { parseExtent, type Extent };
