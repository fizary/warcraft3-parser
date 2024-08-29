import { BinaryStream, decode } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";
import { parseNode, type Node } from "./node.ts";

const enum CornEmitterTag {
    KPPA = 0x4150504B,
    KPPC = 0x4350504B,
    KPPE = 0x4550504B,
    KPPL = 0x4C50504B,
    KPPS = 0x5350504B,
    KPPV = 0x5650504B,
}

type CornEmitterTracks = {
    alpha?: KeyframeTrack<"float32">;
    color?: KeyframeTrack<"vec3f">;
    emissionRate?: KeyframeTrack<"float32">;
    lifespan?: KeyframeTrack<"float32">;
    speed?: KeyframeTrack<"float32">;
    visibility?: KeyframeTrack<"float32">;
}

type CornEmitter = {
    node: Node;
    lifespan: number;
    emissionRate: number;
    speed: number;
    color: Float32Array;
    replaceableId: number;
    path: string;
    flags: string;
    tracks: CornEmitterTracks;
}

function parseCornEmitter(stream: BinaryStream): CornEmitter {
    const cornEmitter = {} as CornEmitter,
        nextOffset = stream.offset + stream.read("u32") - 4;

    cornEmitter.node = parseNode(stream);
    cornEmitter.lifespan = stream.read("f32");
    cornEmitter.emissionRate = stream.read("f32");
    cornEmitter.speed = stream.read("f32");
    cornEmitter.color = stream.read("f32", 4);
    cornEmitter.replaceableId = stream.read("u32");
    cornEmitter.path = decode(stream.read("u8", 260));
    cornEmitter.flags = decode(stream.read("u8", 260));
    cornEmitter.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === CornEmitterTag.KPPA)
            cornEmitter.tracks.alpha = parseKeyframeTrack(stream, "float32");
        else if (tag === CornEmitterTag.KPPC)
            cornEmitter.tracks.color = parseKeyframeTrack(stream, "vec3f");
        else if (tag === CornEmitterTag.KPPE)
            cornEmitter.tracks.emissionRate = parseKeyframeTrack(stream, "float32");
        else if (tag === CornEmitterTag.KPPL)
            cornEmitter.tracks.lifespan = parseKeyframeTrack(stream, "float32");
        else if (tag === CornEmitterTag.KPPS)
            cornEmitter.tracks.speed = parseKeyframeTrack(stream, "float32");
        else if (tag === CornEmitterTag.KPPV)
            cornEmitter.tracks.visibility = parseKeyframeTrack(stream, "float32");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return cornEmitter;
}

export { parseCornEmitter, type CornEmitter };
