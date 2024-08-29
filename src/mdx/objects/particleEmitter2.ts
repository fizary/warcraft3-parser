import { BinaryStream } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";
import { parseNode, type Node } from "./node.ts";

const enum ParticleEmitter2Tag {
    KP2E = 0x4532504B,
    KP2G = 0x4732504B,
    KP2L = 0x4C32504B,
    KP2S = 0x5332504B,
    KP2V = 0x5632504B,
    KP2R = 0x5232504B,
    KP2N = 0x4E32504B,
    KP2W = 0x5732504B,
}

const enum ParticleEmitter2FilterMode {
    Blend = 0,
    Additive = 1,
    Modulate = 2,
    Modulate2x = 3,
    AddAlpha = 4,
}

const enum ParticleEmitter2HeadTailType {
    Head = 0,
    Tail = 1,
    Both = 2,
}

const enum ParticleEmitter2Squirt {
    NoSquirt = 0,
    Squirt = 1,
}

type ParticleEmitter2Tracks = {
    emissionRate?: KeyframeTrack<"float32">;
    gravity?: KeyframeTrack<"float32">;
    latitude?: KeyframeTrack<"float32">;
    speed?: KeyframeTrack<"float32">;
    visibility?: KeyframeTrack<"float32">;
    variation?: KeyframeTrack<"float32">;
    length?: KeyframeTrack<"float32">;
    width?: KeyframeTrack<"float32">;
}

type ParticleEmitter2 = {
    node: Node;
    speed: number;
    variation: number;
    latitude: number;
    gravity: number;
    lifespan: number;
    emissionRate: number;
    length: number;
    width: number;
    filterMode: number;
    rows: number;
    columns: number;
    headOrTail: number;
    tailLength: number;
    time: number;
    segmentColor: Float32Array;
    segmentAlpha: Uint8Array;
    segmentScaling: Float32Array;
    headInterval: Uint32Array;
    headDecayInterval: Uint32Array;
    tailInterval: Uint32Array;
    tailDecayInterval: Uint32Array;
    textureId: number;
    squirt: number;
    priorityPlane: number;
    replaceableId: number;
    tracks: ParticleEmitter2Tracks;
}

function parsePatricleEmitter2(stream: BinaryStream): ParticleEmitter2 {
    const particleEmitter2 = {} as ParticleEmitter2,
        nextOffset = stream.offset + stream.read("u32") - 4;

    particleEmitter2.node = parseNode(stream);
    particleEmitter2.speed = stream.read("f32");
    particleEmitter2.variation = stream.read("f32");
    particleEmitter2.latitude = stream.read("f32");
    particleEmitter2.gravity = stream.read("f32");
    particleEmitter2.lifespan = stream.read("f32");
    particleEmitter2.emissionRate = stream.read("f32");
    particleEmitter2.length = stream.read("f32");
    particleEmitter2.width = stream.read("f32");
    particleEmitter2.filterMode = stream.read("u32");
    particleEmitter2.rows = stream.read("u32");
    particleEmitter2.columns = stream.read("u32");
    particleEmitter2.headOrTail = stream.read("u32");
    particleEmitter2.tailLength = stream.read("f32");
    particleEmitter2.time = stream.read("f32");
    particleEmitter2.segmentColor = stream.read("f32", 9);
    particleEmitter2.segmentAlpha = stream.read("u8", 3);
    particleEmitter2.segmentScaling = stream.read("f32", 3);
    particleEmitter2.headInterval = stream.read("u32", 3);
    particleEmitter2.headDecayInterval = stream.read("u32", 3);
    particleEmitter2.tailInterval = stream.read("u32", 3);
    particleEmitter2.tailDecayInterval = stream.read("u32", 3);
    particleEmitter2.textureId = stream.read("u32");
    particleEmitter2.squirt = stream.read("u32");
    particleEmitter2.priorityPlane = stream.read("u32");
    particleEmitter2.replaceableId = stream.read("u32");
    particleEmitter2.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === ParticleEmitter2Tag.KP2E)
            particleEmitter2.tracks.emissionRate = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitter2Tag.KP2G)
            particleEmitter2.tracks.gravity = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitter2Tag.KP2L)
            particleEmitter2.tracks.latitude = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitter2Tag.KP2S)
            particleEmitter2.tracks.speed = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitter2Tag.KP2V)
            particleEmitter2.tracks.visibility = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitter2Tag.KP2R)
            particleEmitter2.tracks.variation = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitter2Tag.KP2N)
            particleEmitter2.tracks.length = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitter2Tag.KP2W)
            particleEmitter2.tracks.width = parseKeyframeTrack(stream, "float32");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return particleEmitter2;
}

export { parsePatricleEmitter2, ParticleEmitter2FilterMode, ParticleEmitter2HeadTailType, ParticleEmitter2Squirt, type ParticleEmitter2 };
