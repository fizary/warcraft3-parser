import { BinaryStream } from "hexcod";
import { UnrecognizedChunkError, UnrecognizedValueError } from "../errors";
import { parseFloat32Track, parseVec3fTrack, type Float32Track, type Vec3fTrack } from "../shared/tracks";

const enum GEOSET_ANIMATION_TAGS {
    KGAO = 0x4F41474B,
    KGAC = 0x4341474B,
};

type GeosetAnimationTracks = {
    alpha?: Float32Track;
    color?: Vec3fTrack;
};

type GeosetAnimation = {
    type: "none" | "drop-shadow" | "color" | "both";
    geosetId: number;
    color: Float32Array;
    alpha: number;
    tracks: GeosetAnimationTracks;
};

function stringifyType(type: number, currentOffset: number): GeosetAnimation["type"] {
    switch (type) {
        case 0:
            return "none";
        case 1:
            return "drop-shadow";
        case 2:
            return "color";
        case 3:
            return "both";
        default:
            throw new UnrecognizedValueError(currentOffset - 4, "GeosetAnimation", "type", type, "0 = none, 1 = drop-shadow, 2 = color, 3 = both");
    }
}

function parseGeosetAnimation(stream: BinaryStream): GeosetAnimation {
    const geosetAnimation = {} as GeosetAnimation,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read geoset animation fields
    geosetAnimation.alpha = stream.read("f32");
    geosetAnimation.type = stringifyType(stream.read("u32"), stream.offset);
    geosetAnimation.color = stream.read("f32", 3);
    geosetAnimation.geosetId = stream.read("u32");

    // Read geoset animation tracks
    geosetAnimation.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === GEOSET_ANIMATION_TAGS.KGAO)
            geosetAnimation.tracks.alpha = parseFloat32Track(stream);
        else if (tag === GEOSET_ANIMATION_TAGS.KGAC)
            geosetAnimation.tracks.color = parseVec3fTrack(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "GeosetAnimation", tag, "KGAO, KGAC");
    }

    return geosetAnimation;
}

export { parseGeosetAnimation, type GeosetAnimation };
