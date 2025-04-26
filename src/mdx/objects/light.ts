import { BinaryStream } from "hexcod";
import { UnrecognizedChunkError, UnrecognizedValueError } from "../errors";
import { parseNode, type Node } from "../shared/node";
import { parseFloat32Track, parseVec3fTrack, type Float32Track, type Vec3fTrack } from "../shared/tracks";

const enum LIGHT_TAGS {
    KLAS = 0x53414C4B,
    KLAE = 0x45414C4B,
    KLAC = 0x43414C4B,
    KLAI = 0x49414C4B,
    KLBI = 0x49424C4B,
    KLBC = 0x43424C4B,
    KLAV = 0x56414C4B,
};

type LightTracks = {
    attenuationStart?: Float32Track;
    attenuationEnd?: Float32Track;
    color?: Vec3fTrack;
    intensity?: Float32Track;
    ambientIntensity?: Float32Track;
    ambientColor?: Vec3fTrack;
    visibility?: Float32Track;
};

type Light = {
    type: "omnidirectional" | "directional" | "ambient";
    node: Node;
    attenuationStart: number;
    attenuationEnd: number;
    color: Float32Array;
    intensity: number;
    ambientColor: Float32Array;
    ambientIntensity: number;
    tracks: LightTracks;
};

function stringifyType(type: number, currentOffset: number): Light["type"] {
    switch (type) {
        case 0:
            return "omnidirectional";
        case 1:
            return "directional";
        case 2:
            return "ambient";
        default:
            throw new UnrecognizedValueError(currentOffset - 4, "Light", "type", type, "0 = omnidirectional, 1 = directional, 2 = ambient");
    }
}

function parseLight(stream: BinaryStream): Light {
    const light = {} as Light,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read light fields
    light.node = parseNode(stream);
    light.type = stringifyType(stream.read("u32"), stream.offset);
    light.attenuationStart = stream.read("f32");
    light.attenuationEnd = stream.read("f32");
    light.color = stream.read("f32", 3);
    light.intensity = stream.read("f32");
    light.ambientColor = stream.read("f32", 3);
    light.ambientIntensity = stream.read("f32");

    // Read light tracks
    light.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === LIGHT_TAGS.KLAS)
            light.tracks.attenuationStart = parseFloat32Track(stream);
        else if (tag === LIGHT_TAGS.KLAE)
            light.tracks.attenuationEnd = parseFloat32Track(stream);
        else if (tag === LIGHT_TAGS.KLAC)
            light.tracks.color = parseVec3fTrack(stream);
        else if (tag === LIGHT_TAGS.KLAI)
            light.tracks.intensity = parseFloat32Track(stream);
        else if (tag === LIGHT_TAGS.KLBI)
            light.tracks.ambientIntensity = parseFloat32Track(stream);
        else if (tag === LIGHT_TAGS.KLBC)
            light.tracks.ambientColor = parseVec3fTrack(stream);
        else if (tag === LIGHT_TAGS.KLAV)
            light.tracks.visibility = parseFloat32Track(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "Light", tag, "KLAS, KLAE, KLAC, KLAI, KLBI, KLBC, KLAV");
    }

    return light;
}

export { parseLight, type Light };
