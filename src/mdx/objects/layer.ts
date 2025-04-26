import { BinaryStream } from "hexcod";
import { UnrecognizedChunkError, UnrecognizedValueError } from "../errors";
import { parseFloat32Track, parseUint32Track, parseVec3fTrack, type Float32Track, type Uint32Track, type Vec3fTrack } from "../shared/tracks";

const enum LAYER_TAGS {
    KMTF = 0x46544D4B,
    KMTA = 0x41544D4B,
    KMTE = 0x45544D4B,
    KFC3 = 0x3343464B,
    KFCA = 0x4143464B,
    KFTC = 0x4354464B,
};

const LAYER_SHADING_FLAGS = {
    Unshaded: 1,
    SphereEnvironmentMap: 2,
    TwoSided: 16,
    Unfogged: 32,
    NoDepthTest: 64,
    NoDepthSet: 128,
} as const;

type LayerTracks = {
    textureId?: Uint32Track;
    alpha?: Float32Track;
    emissiveGain?: Float32Track;
    fresnelColor?: Vec3fTrack;
    fresnelAlpha?: Float32Track;
    fresnelTeamColor?: Float32Track;
};

type Layer = {
    filterMode: "none" | "transparent" | "blend" | "additive" | "add-alpha" | "modulate" | "modulate2x";
    shadingFlags: number;
    textureId: number;
    textureAnimationId: number;
    coordId: number;
    alpha: number;
    emissiveGain?: number;
    fresnelColor?: Float32Array;
    fresnelAlpha?: number;
    fresnelTeamColor?: number;
    tracks: LayerTracks;
};

function stringifyFilterMode(filterMode: number, currentOffset: number): Layer["filterMode"] {
    switch (filterMode) {
        case 0:
            return "none";
        case 1:
            return "transparent";
        case 2:
            return "blend";
        case 3:
            return "additive";
        case 4:
            return "add-alpha";
        case 5:
            return "modulate";
        case 6:
            return "modulate2x";
        default:
            throw new UnrecognizedValueError(currentOffset - 4, "Layer", "filterMode", filterMode, "0 = none, 1 = transparent, 2 = blend, 3 = additive, 4 = add-alpha, 5 = modulate, 6 = modulate2x");
    }
}

function parseLayer(stream: BinaryStream, version: number): Layer {
    const layer = {} as Layer,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read layer fields
    layer.filterMode = stringifyFilterMode(stream.read("u32"), stream.offset);
    layer.shadingFlags = stream.read("u32");
    layer.textureId = stream.read("u32");
    layer.textureAnimationId = stream.read("u32");
    layer.coordId = stream.read("u32");
    layer.alpha = stream.read("f32");

    if (version >= 900) {
        layer.emissiveGain = stream.read("f32");
        layer.fresnelColor = stream.read("f32", 3);
        layer.fresnelAlpha = stream.read("f32");
        layer.fresnelTeamColor = stream.read("f32");
    }

    // Read layer tracks
    layer.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === LAYER_TAGS.KMTF)
            layer.tracks.textureId = parseUint32Track(stream);
        else if (tag === LAYER_TAGS.KMTA)
            layer.tracks.alpha = parseFloat32Track(stream);
        else if (tag === LAYER_TAGS.KMTE && version >= 900)
            layer.tracks.emissiveGain = parseFloat32Track(stream);
        else if (tag === LAYER_TAGS.KFC3 && version >= 1000)
            layer.tracks.fresnelColor = parseVec3fTrack(stream);
        else if (tag === LAYER_TAGS.KFCA && version >= 1000)
            layer.tracks.fresnelAlpha = parseFloat32Track(stream);
        else if (tag === LAYER_TAGS.KFTC && version >= 1000)
            layer.tracks.fresnelTeamColor = parseFloat32Track(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "Layer", tag, version >= 1000 ? "KMTF, KMTA, KMTE, KFC3, KFCA, KFTC" : version >= 900 ? "KMTF, KMTA, KMTE" : "KMTF, KMTA");
    }

    return layer;
}

export { parseLayer, LAYER_SHADING_FLAGS, type Layer };
