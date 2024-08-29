import { BinaryStream } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";

const enum TextureAnimationTag {
    KTAT = 0x5441544B,
    KTAR = 0x5241544B,
    KTAS = 0x5341544B,
}

type TextureAnimationTracks = {
    translation?: KeyframeTrack<"vec3f">;
    rotation?: KeyframeTrack<"vec4f">;
    scaling?: KeyframeTrack<"vec3f">;
}

type TextureAnimation = {
    tracks: TextureAnimationTracks;
}

function parseTextureAnimation(stream: BinaryStream): TextureAnimation {
    const textureAnimation = {} as TextureAnimation,
        nextOffset = stream.offset + stream.read("u32") - 4;

    textureAnimation.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === TextureAnimationTag.KTAT)
            textureAnimation.tracks.translation = parseKeyframeTrack(stream, "vec3f");
        else if (tag === TextureAnimationTag.KTAR)
            textureAnimation.tracks.rotation = parseKeyframeTrack(stream, "vec4f");
        else if (tag === TextureAnimationTag.KTAS)
            textureAnimation.tracks.scaling = parseKeyframeTrack(stream, "vec3f");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return textureAnimation;
}

export { parseTextureAnimation, type TextureAnimation };
