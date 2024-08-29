import { BinaryStream } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";
import { parseNode, type Node } from "./node.ts";

const enum LightTag {
    KLAS = 0x53414C4B,
    KLAE = 0x45414C4B,
    KLAC = 0x43414C4B,
    KLAI = 0x49414C4B,
    KLBI = 0x49424C4B,
    KLBC = 0x43424C4B,
    KLAV = 0x56414C4B,
}

const enum LightType {
    Omnidirectional = 0,
    Directional = 1,
    Ambient = 2,
}

type LightTracks = {
    attenuationStart?: KeyframeTrack<"float32">;
    attenuationEnd?: KeyframeTrack<"float32">;
    color?: KeyframeTrack<"vec3f">;
    intensity?: KeyframeTrack<"float32">;
    ambientIntensity?: KeyframeTrack<"float32">;
    ambientColor?: KeyframeTrack<"vec3f">;
    visibility?: KeyframeTrack<"float32">;
}

type Light = {
    node: Node;
    type: number;
    attenuationStart: number;
    attenuationEnd: number;
    color: Float32Array;
    intensity: number;
    ambientColor: Float32Array;
    ambientIntensity: number;
    tracks: LightTracks;
}

function parseLight(stream: BinaryStream): Light {
    const light = {} as Light,
        nextOffset = stream.offset + stream.read("u32") - 4;

    light.node = parseNode(stream);
    light.type = stream.read("u32");
    light.attenuationStart = stream.read("f32");
    light.attenuationEnd = stream.read("f32");
    light.color = stream.read("f32", 3);
    light.intensity = stream.read("f32");
    light.ambientColor = stream.read("f32", 3);
    light.ambientIntensity = stream.read("f32");
    light.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === LightTag.KLAS)
            light.tracks.attenuationStart = parseKeyframeTrack(stream, "float32");
        else if (tag === LightTag.KLAE)
            light.tracks.attenuationEnd = parseKeyframeTrack(stream, "float32");
        else if (tag === LightTag.KLAC)
            light.tracks.color = parseKeyframeTrack(stream, "vec3f");
        else if (tag === LightTag.KLAI)
            light.tracks.intensity = parseKeyframeTrack(stream, "float32");
        else if (tag === LightTag.KLBI)
            light.tracks.ambientIntensity = parseKeyframeTrack(stream, "float32");
        else if (tag === LightTag.KLBC)
            light.tracks.ambientColor = parseKeyframeTrack(stream, "vec3f");
        else if (tag === LightTag.KLAV)
            light.tracks.visibility = parseKeyframeTrack(stream, "float32");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return light;
}

export { parseLight, LightType, type Light };
