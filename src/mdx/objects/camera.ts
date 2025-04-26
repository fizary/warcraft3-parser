import { BinaryStream, decode } from "hexcod";
import { UnrecognizedChunkError } from "../errors";
import { parseFloat32Track, parseVec3fTrack, type Float32Track, type Vec3fTrack } from "../shared/tracks";

const enum CAMERA_TAGS {
    KCTR = 0x5254434B,
    KCRL = 0x4C52434B,
    KTTR = 0x5254544B,
};

type CameraTracks = {
    translation?: Vec3fTrack;
    rotation?: Float32Track;
    targetTranslation?: Vec3fTrack;
};

type Camera = {
    name: string;
    position: Float32Array;
    fieldOfView: number;
    farClippingPlane: number;
    nearClippingPlane: number;
    targetPosition: Float32Array;
    tracks: CameraTracks;
};

function parseCamera(stream: BinaryStream): Camera {
    const camera = {} as Camera,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read camera fields
    camera.name = decode(stream.read("u8", 80));
    camera.position = stream.read("f32", 3);
    camera.fieldOfView = stream.read("f32");
    camera.farClippingPlane = stream.read("f32");
    camera.nearClippingPlane = stream.read("f32");
    camera.targetPosition = stream.read("f32", 3);

    // Read camera tracks
    camera.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === CAMERA_TAGS.KCTR)
            camera.tracks.translation = parseVec3fTrack(stream);
        else if (tag === CAMERA_TAGS.KCRL)
            camera.tracks.rotation = parseFloat32Track(stream);
        else if (tag === CAMERA_TAGS.KTTR)
            camera.tracks.targetTranslation = parseVec3fTrack(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "Camera", tag, "KCTR, KCRL, KTTR");
    }

    return camera;
}

export { parseCamera, type Camera };
