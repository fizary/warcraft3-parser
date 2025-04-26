import { BinaryStream } from "hexcod";
import { UnrecognizedChunkError, UnrecognizedValueError } from "../errors";
import { parseNode, type Node } from "../shared/node";
import { parseFloat32Track, type Float32Track } from "../shared/tracks";

const enum PARTICLE_EMITTER_2_TAGS {
    KP2E = 0x4532504B,
    KP2G = 0x4732504B,
    KP2L = 0x4C32504B,
    KP2S = 0x5332504B,
    KP2V = 0x5632504B,
    KP2R = 0x5232504B,
    KP2N = 0x4E32504B,
    KP2W = 0x5732504B,
};

type ParticleEmitter2Tracks = {
    emissionRate?: Float32Track;
    gravity?: Float32Track;
    latitude?: Float32Track;
    speed?: Float32Track;
    visibility?: Float32Track;
    variation?: Float32Track;
    length?: Float32Track;
    width?: Float32Track;
};

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
    filterMode: "blend" | "additive" | "add-alpha" | "modulate" | "modulate2x";
    rows: number;
    columns: number;
    emissionPoint: "head" | "tail" | "both";
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
    squirt: boolean;
    priorityPlane: number;
    replaceableId: number;
    tracks: ParticleEmitter2Tracks;
};

function stringifyFilterMode(filterMode: number, currentOffset: number): ParticleEmitter2["filterMode"] {
    switch (filterMode) {
        case 0:
            return "blend";
        case 1:
            return "additive";
        case 2:
            return "modulate";
        case 3:
            return "modulate2x";
        case 4:
            return "add-alpha";
        default:
            throw new UnrecognizedValueError(currentOffset - 4, "ParticleEmitter2", "filterMode", filterMode, "0 = blend, 1 = additive, 2 = modulate, 3 = modulate2x, 4 = add-alpha");
    }
}

function stringifyEmissionPoint(emissionPoint: number, currentOffset: number): ParticleEmitter2["emissionPoint"] {
    switch (emissionPoint) {
        case 0:
            return "head";
        case 1:
            return "tail";
        case 2:
            return "both";
        default:
            throw new UnrecognizedValueError(currentOffset - 4, "ParticleEmitter2", "emissionPoint", emissionPoint, "0 = head, 1 = tail, 2 = both");
    }
}

function booleanifySquirt(squirt: number, currentOffset: number): boolean {
    switch (squirt) {
        case 0:
            return false;
        case 1:
            return true;
        default:
            throw new UnrecognizedValueError(currentOffset - 4, "ParticleEmitter2", "squirt", squirt, "0 = false, 1 = true");
    }
}

function parseParticleEmitter2(stream: BinaryStream): ParticleEmitter2 {
    const particleEmitter2 = {} as ParticleEmitter2,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read emitter fields
    particleEmitter2.node = parseNode(stream);
    particleEmitter2.speed = stream.read("f32");
    particleEmitter2.variation = stream.read("f32");
    particleEmitter2.latitude = stream.read("f32");
    particleEmitter2.gravity = stream.read("f32");
    particleEmitter2.lifespan = stream.read("f32");
    particleEmitter2.emissionRate = stream.read("f32");
    particleEmitter2.length = stream.read("f32");
    particleEmitter2.width = stream.read("f32");
    particleEmitter2.filterMode = stringifyFilterMode(stream.read("u32"), stream.offset);
    particleEmitter2.rows = stream.read("u32");
    particleEmitter2.columns = stream.read("u32");
    particleEmitter2.emissionPoint = stringifyEmissionPoint(stream.read("u32"), stream.offset);
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
    particleEmitter2.squirt = booleanifySquirt(stream.read("u32"), stream.offset);
    particleEmitter2.priorityPlane = stream.read("u32");
    particleEmitter2.replaceableId = stream.read("u32");

    // Read emitter tracks
    particleEmitter2.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === PARTICLE_EMITTER_2_TAGS.KP2E)
            particleEmitter2.tracks.emissionRate = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_2_TAGS.KP2G)
            particleEmitter2.tracks.gravity = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_2_TAGS.KP2L)
            particleEmitter2.tracks.latitude = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_2_TAGS.KP2S)
            particleEmitter2.tracks.speed = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_2_TAGS.KP2V)
            particleEmitter2.tracks.visibility = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_2_TAGS.KP2R)
            particleEmitter2.tracks.variation = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_2_TAGS.KP2N)
            particleEmitter2.tracks.length = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_2_TAGS.KP2W)
            particleEmitter2.tracks.width = parseFloat32Track(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "ParticleEmitter2", tag, "KP2E, KP2G, KP2L, KP2S, KP2V, KP2R, KP2N, KP2W");
    }

    return particleEmitter2;
}

export { parseParticleEmitter2, type ParticleEmitter2 };
