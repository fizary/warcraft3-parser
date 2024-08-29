import { BinaryStream, decode } from "hexcod";
import { parseExtent, type Extent } from "./extent.ts";

type Metadata = {
    name: string;
    animationFileName: string;
    extent: Extent;
    blendTime: number;
}

function parseMetadata(stream: BinaryStream): Metadata {
    const metadata = {} as Metadata;

    metadata.name = decode(stream.read("u8", 80));
    metadata.animationFileName = decode(stream.read("u8", 260));
    metadata.extent = parseExtent(stream);
    metadata.blendTime = stream.read("u32");

    return metadata;
}

export { parseMetadata, type Metadata };
