import { BinaryStream } from "hexcod";

const enum TrackInterpolationType {
    None = 0,
    Linear = 1,
    Hermite = 2,
    Bezier = 3,
}

type KeyframeType = "uint32" | "float32" | "vec3f" | "vec4f";

type KeyframeValue<T extends KeyframeType> =
    T extends "vec3f" | "vec4f"
    ? Float32Array
    : T extends "uint32" | "float32"
    ? number
    : never;

type Keyframe<T extends KeyframeType> = {
    time: number;
    value: KeyframeValue<T>;
    inTan?: KeyframeValue<T>;
    outTan?: KeyframeValue<T>;
}

type KeyframeTrack<T extends KeyframeType> = {
    interpolationType: number;
    globalSequenceId: number;
    keyframes: Keyframe<T>[];
}

function parseKeyframeValue<T extends KeyframeType>(stream: BinaryStream, type: T): KeyframeValue<T> {
    return (
        type === "vec3f" ? stream.read("f32", 3)
        : type === "vec4f" ? stream.read("f32", 4)
        : type === "uint32" ? stream.read("u32")
        : type === "float32" ? stream.read("f32")
        : undefined
    ) as KeyframeValue<T>;
}

function parseKeyframeTrack<T extends KeyframeType>(stream: BinaryStream, type: T): KeyframeTrack<T> {
    const track = {} as KeyframeTrack<T>,
        count = stream.read("u32");

    track.interpolationType = stream.read("u32");
    track.globalSequenceId = stream.read("u32");
    track.keyframes = [];

    for (let x = 0; x < count; x++) {
        const keyframe = {} as Keyframe<T>;

        keyframe.time = stream.read("i32");
        keyframe.value = parseKeyframeValue(stream, type);

        if (track.interpolationType > 1) {
            keyframe.inTan = parseKeyframeValue(stream, type);
            keyframe.outTan = parseKeyframeValue(stream, type);
        }

        track.keyframes.push(keyframe);
    }

    return track;
}

export { parseKeyframeTrack, TrackInterpolationType, type KeyframeTrack };
