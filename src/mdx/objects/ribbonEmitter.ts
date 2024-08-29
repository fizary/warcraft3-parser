import { BinaryStream } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";
import { parseNode, type Node } from "./node.ts";

const enum RibbonEmitterTag {
    KRVS = 0x5356524B,
    KRHA = 0x4148524B,
    KRHB = 0x4248524B,
    KRAL = 0x4C41524B,
    KRCO = 0x4F43524B,
    KRTX = 0x5854524B,
}

type RibbonEmitterTracks = {
    visibility?: KeyframeTrack<"float32">;
    heightAbove?: KeyframeTrack<"float32">;
    heightBelow?: KeyframeTrack<"float32">;
    alpha?: KeyframeTrack<"float32">;
    color?: KeyframeTrack<"vec3f">;
    textureSlot?: KeyframeTrack<"uint32">;
}

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
}

function parseRibbonEmitter(stream: BinaryStream): RibbonEmitter {
    const ribbonEmitter = {} as RibbonEmitter,
        nextOffset = stream.offset + stream.read("u32") - 4;

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
    ribbonEmitter.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === RibbonEmitterTag.KRVS)
            ribbonEmitter.tracks.visibility = parseKeyframeTrack(stream, "float32");
        else if (tag === RibbonEmitterTag.KRHA)
            ribbonEmitter.tracks.heightAbove = parseKeyframeTrack(stream, "float32");
        else if (tag === RibbonEmitterTag.KRHB)
            ribbonEmitter.tracks.heightBelow = parseKeyframeTrack(stream, "float32");
        else if (tag === RibbonEmitterTag.KRAL)
            ribbonEmitter.tracks.alpha = parseKeyframeTrack(stream, "float32");
        else if (tag === RibbonEmitterTag.KRCO)
            ribbonEmitter.tracks.color = parseKeyframeTrack(stream, "vec3f");
        else if (tag === RibbonEmitterTag.KRTX)
            ribbonEmitter.tracks.textureSlot = parseKeyframeTrack(stream, "uint32");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return ribbonEmitter;
}

export { parseRibbonEmitter, type RibbonEmitter };
