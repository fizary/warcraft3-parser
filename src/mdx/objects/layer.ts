import { BinaryStream } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";

const enum LayerTag {
    KMTF = 0x46544D4B,
    KMTA = 0x41544D4B,
    KMTE = 0x45544D4B,
    KFC3 = 0x3343464B,
    KFCA = 0x4143464B,
    KFTC = 0x4354464B,
}

const enum LayerFilterMode {
    None = 0,
    Transparent = 1,
    Blend = 2,
    Additive = 3,
    AddAlpha = 4,
    Modulate = 5,
    Modulate2x = 6,
}

const enum LayerShading {
    Unshaded = 1,
    SphereEnvironmentMap = 2,
    TwoSided = 16,
    Unfogged = 32,
    NoDepthTest = 64,
    NoDepthSet = 128,
}

type LayerTracks = {
    textureId?: KeyframeTrack<"uint32">;
    alpha?: KeyframeTrack<"float32">;
    emissiveGain?: KeyframeTrack<"float32">;
    fresnelColor?: KeyframeTrack<"vec3f">;
    fresnelAlpha?: KeyframeTrack<"float32">;
    fresnelTeamColor?: KeyframeTrack<"float32">;
}

type Layer = {
    filterMode: number;
    shading: number;
    textureId: number;
    textureAnimationId: number;
    coordId: number;
    alpha: number;
    emissiveGain: number;
    fresnelColor: Float32Array;
    fresnelAlpha: number;
    fresnelTeamColor: number;
    tracks: LayerTracks;
}

function parseLayer(stream: BinaryStream): Layer {
    const layer = {} as Layer,
        nextOffset = stream.offset + stream.read("u32") - 4;

    layer.filterMode = stream.read("u32");
    layer.shading = stream.read("u32");
    layer.textureId = stream.read("u32");
    layer.textureAnimationId = stream.read("u32");
    layer.coordId = stream.read("u32");
    layer.alpha = stream.read("f32");
    layer.emissiveGain = stream.read("f32");
    layer.fresnelColor = stream.read("f32", 3);
    layer.fresnelAlpha = stream.read("f32");
    layer.fresnelTeamColor = stream.read("f32");
    layer.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === LayerTag.KMTF)
            layer.tracks.textureId = parseKeyframeTrack(stream, "uint32");
        else if (tag === LayerTag.KMTA)
            layer.tracks.alpha = parseKeyframeTrack(stream, "float32");
        else if (tag === LayerTag.KMTE)
            layer.tracks.emissiveGain = parseKeyframeTrack(stream, "float32");
        else if (tag === LayerTag.KFC3)
            layer.tracks.fresnelColor = parseKeyframeTrack(stream, "vec3f");
        else if (tag === LayerTag.KFCA)
            layer.tracks.fresnelAlpha = parseKeyframeTrack(stream, "float32");
        else if (tag === LayerTag.KFTC)
            layer.tracks.fresnelTeamColor = parseKeyframeTrack(stream, "float32");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return layer;
}

export { parseLayer, LayerFilterMode, LayerShading, type Layer };
