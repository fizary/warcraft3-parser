import { BinaryStream, decode } from "hexcod";
import { UnrecognizedChunkError } from "../errors";
import { parseNode, type Node } from "../shared/node";
import { parseFloat32Track, parseVec3fTrack, type Float32Track, type Vec3fTrack } from "../shared/tracks";

const enum CORN_EMITTER_TAGS {
    KPPA = 0x4150504B,
    KPPC = 0x4350504B,
    KPPE = 0x4550504B,
    KPPL = 0x4C50504B,
    KPPS = 0x5350504B,
    KPPV = 0x5650504B,
};

type CornEmitterTracks = {
    alpha?: Float32Track;
    color?: Vec3fTrack;
    emissionRate?: Float32Track;
    lifespan?: Float32Track;
    speed?: Float32Track;
    visibility?: Float32Track;
};

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
};

function parseCornEmitter(stream: BinaryStream): CornEmitter {
    const cornEmitter = {} as CornEmitter,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read emitter fields
    cornEmitter.node = parseNode(stream);
    cornEmitter.lifespan = stream.read("f32");
    cornEmitter.emissionRate = stream.read("f32");
    cornEmitter.speed = stream.read("f32");
    cornEmitter.color = stream.read("f32", 4);
    cornEmitter.replaceableId = stream.read("u32");
    cornEmitter.path = decode(stream.read("u8", 260));
    cornEmitter.flags = decode(stream.read("u8", 260));

    // Read emitter tracks
    cornEmitter.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === CORN_EMITTER_TAGS.KPPA)
            cornEmitter.tracks.alpha = parseFloat32Track(stream);
        else if (tag === CORN_EMITTER_TAGS.KPPC)
            cornEmitter.tracks.color = parseVec3fTrack(stream);
        else if (tag === CORN_EMITTER_TAGS.KPPE)
            cornEmitter.tracks.emissionRate = parseFloat32Track(stream);
        else if (tag === CORN_EMITTER_TAGS.KPPL)
            cornEmitter.tracks.lifespan = parseFloat32Track(stream);
        else if (tag === CORN_EMITTER_TAGS.KPPS)
            cornEmitter.tracks.speed = parseFloat32Track(stream);
        else if (tag === CORN_EMITTER_TAGS.KPPV)
            cornEmitter.tracks.visibility = parseFloat32Track(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "CornEmitter", tag, "KPPA, KPPC, KPPE, KPPL, KPPS, KPPV");
    }

    return cornEmitter;
}

export { parseCornEmitter, type CornEmitter };
