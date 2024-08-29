import { BinaryStream, decode } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";

const enum CameraTag {
    KCTR = 0x5254434B,
    KCRL = 0x4C52434B,
    KTTR = 0x5254544B,
}

type CameraTracks = {
    translation?: KeyframeTrack<"vec3f">;
    rotation?: KeyframeTrack<"float32">;
    targetTranslation?: KeyframeTrack<"vec3f">;
}

type Camera = {
    name: string;
    position: Float32Array;
    filedOfView: number;
    farClippingPlane: number;
    nearClippingPlane: number;
    targetPosition: Float32Array;
    tracks: CameraTracks;
}

function parseCamera(stream: BinaryStream): Camera {
    const camera = {} as Camera,
        nextOffset = stream.offset + stream.read("u32") - 4;

    camera.name = decode(stream.read("u8", 80));
    camera.position = stream.read("f32", 3);
    camera.filedOfView = stream.read("f32");
    camera.farClippingPlane = stream.read("f32");
    camera.nearClippingPlane = stream.read("f32");
    camera.targetPosition = stream.read("f32", 3);
    camera.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === CameraTag.KCTR)
            camera.tracks.translation = parseKeyframeTrack(stream, "vec3f");
        else if (tag === CameraTag.KCRL)
            camera.tracks.rotation = parseKeyframeTrack(stream, "float32");
        else if (tag === CameraTag.KTTR)
            camera.tracks.targetTranslation = parseKeyframeTrack(stream, "vec3f");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return camera;
}

export { parseCamera, type Camera };
