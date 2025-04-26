import { BinaryStream } from "hexcod";
import { UnrecognizedChunkError } from "../errors";
import { parseNode, type Node } from "../shared/node";
import { parseFloat32Track, parseUint32Track, parseVec3fTrack, type Float32Track, type Uint32Track, type Vec3fTrack } from "../shared/tracks";

const enum RIBBON_EMITTER_TAGS {
    KRVS = 0x5356524B,
    KRHA = 0x4148524B,
    KRHB = 0x4248524B,
    KRAL = 0x4C41524B,
    KRCO = 0x4F43524B,
    KRTX = 0x5854524B,
};

type RibbonEmitterTracks = {
    visibility?: Float32Track;
    heightAbove?: Float32Track;
    heightBelow?: Float32Track;
    alpha?: Float32Track;
    color?: Vec3fTrack;
    textureSlot?: Uint32Track;
};

type RibbonEmitter = {
    node: Node;
    heightAbove: number;
    heightBelow: number;
    alpha: number;
    color: Float32Array;
    lifespan: number;
    textureSlot: number;
    emissionRate: number;
    rows: number;
    columns: number;
    materialId: number;
    gravity: number;
    tracks: RibbonEmitterTracks;
};

function parseRibbonEmitter(stream: BinaryStream): RibbonEmitter {
    const ribbonEmitter = {} as RibbonEmitter,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read emitter fields
    ribbonEmitter.node = parseNode(stream);
    ribbonEmitter.heightAbove = stream.read("f32");
    ribbonEmitter.heightBelow = stream.read("f32");
    ribbonEmitter.alpha = stream.read("f32");
    ribbonEmitter.color = stream.read("f32", 3);
    ribbonEmitter.lifespan = stream.read("f32");
    ribbonEmitter.textureSlot = stream.read("u32");
    ribbonEmitter.emissionRate = stream.read("u32");
    ribbonEmitter.rows = stream.read("u32");
    ribbonEmitter.columns = stream.read("u32");
    ribbonEmitter.materialId = stream.read("u32");
    ribbonEmitter.gravity = stream.read("f32");

    // Read emitter tracks
    ribbonEmitter.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === RIBBON_EMITTER_TAGS.KRVS)
            ribbonEmitter.tracks.visibility = parseFloat32Track(stream);
        else if (tag === RIBBON_EMITTER_TAGS.KRHA)
            ribbonEmitter.tracks.heightAbove = parseFloat32Track(stream);
        else if (tag === RIBBON_EMITTER_TAGS.KRHB)
            ribbonEmitter.tracks.heightBelow = parseFloat32Track(stream);
        else if (tag === RIBBON_EMITTER_TAGS.KRAL)
            ribbonEmitter.tracks.alpha = parseFloat32Track(stream);
        else if (tag === RIBBON_EMITTER_TAGS.KRCO)
            ribbonEmitter.tracks.color = parseVec3fTrack(stream);
        else if (tag === RIBBON_EMITTER_TAGS.KRTX)
            ribbonEmitter.tracks.textureSlot = parseUint32Track(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "RibbonEmitter", tag, "KRVS, KRHA, KRHB, KRAL, KRCO, KRTX");
    }

    return ribbonEmitter;
}

export { parseRibbonEmitter, type RibbonEmitter };
