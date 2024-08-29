import { BinaryStream } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";

const enum GeosetAnimationTag {
    KGAO = 0x4F41474B,
    KGAC = 0x4341474B,
}

const enum GeosetAnimationType {
    None = 0,
    DropShadow = 1,
    Color = 2,
    Both = 3,
}

type GeosetAnimationTracks = {
    alpha?: KeyframeTrack<"float32">;
    color?: KeyframeTrack<"vec3f">;
}

type GeosetAnimation = {
    alpha: number;
    animationType: number;
    color: Float32Array;
    geosetId: number;
    tracks: GeosetAnimationTracks;
}

function parseGeosetAnimation(stream: BinaryStream): GeosetAnimation {
    const geosetAnimation = {} as GeosetAnimation,
        nextOffset = stream.offset + stream.read("u32") - 4;

    geosetAnimation.alpha = stream.read("f32");
    geosetAnimation.animationType = stream.read("u32");
    geosetAnimation.color = stream.read("f32", 3);
    geosetAnimation.geosetId = stream.read("u32");
    geosetAnimation.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === GeosetAnimationTag.KGAO)
            geosetAnimation.tracks.alpha = parseKeyframeTrack(stream, "float32");
        else if (tag === GeosetAnimationTag.KGAC)
            geosetAnimation.tracks.color = parseKeyframeTrack(stream, "vec3f");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return geosetAnimation;
}

export { parseGeosetAnimation, GeosetAnimationType, type GeosetAnimation };
