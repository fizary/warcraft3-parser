import { BinaryStream } from "hexcod";
import { UnrecognizedChunkError } from "../errors";
import { parseVec3fTrack, parseVec4fTrack, type Vec3fTrack, type Vec4fTrack } from "../shared/tracks";

const enum TEXTURE_ANIMATION_TAGS {
    KTAT = 0x5441544B,
    KTAR = 0x5241544B,
    KTAS = 0x5341544B,
};

type TextureAnimationTracks = {
    translation?: Vec3fTrack;
    rotation?: Vec4fTrack;
    scaling?: Vec3fTrack;
};

type TextureAnimation = {
    tracks: TextureAnimationTracks;
};

function parseTextureAnimation(stream: BinaryStream): TextureAnimation {
    const textureAnimation = {} as TextureAnimation,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read texture animation tracks
    textureAnimation.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === TEXTURE_ANIMATION_TAGS.KTAT)
            textureAnimation.tracks.translation = parseVec3fTrack(stream);
        else if (tag === TEXTURE_ANIMATION_TAGS.KTAR)
            textureAnimation.tracks.rotation = parseVec4fTrack(stream);
        else if (tag === TEXTURE_ANIMATION_TAGS.KTAS)
            textureAnimation.tracks.scaling = parseVec3fTrack(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "TextureAnimation", tag, "KTAT, KTAR, KTAS");
    }

    return textureAnimation;
}

export { parseTextureAnimation, type TextureAnimation };
