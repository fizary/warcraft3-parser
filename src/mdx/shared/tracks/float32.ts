import { BinaryStream } from "hexcod";
import { parseInterpolationType } from "../interpolation";

type Float32Keyframe = {
    time: number;
    value: number;
};

type Float32TangentKeyframe = {
    time: number;
    value: number;
    inTan: number;
    outTan: number;
};

type Float32NoInterpolationTrack = {
    interpolationType: "none";
    globalSequenceId: number;
    keyframes: Float32Keyframe[];
};

type Float32LinearTrack = {
    interpolationType: "linear";
    globalSequenceId: number;
    keyframes: Float32Keyframe[];
};

type Float32HermiteTrack = {
    interpolationType: "hermite";
    globalSequenceId: number;
    keyframes: Float32TangentKeyframe[];
};

type Float32BezierTrack = {
    interpolationType: "bezier";
    globalSequenceId: number;
    keyframes: Float32TangentKeyframe[];
};

type Float32Track = Float32NoInterpolationTrack | Float32LinearTrack | Float32HermiteTrack | Float32BezierTrack;

function parseFloat32Track(stream: BinaryStream): Float32Track {
    const track = {} as Float32Track,
        count = stream.read("u32");

    track.interpolationType = parseInterpolationType(stream);
    track.globalSequenceId = stream.read("u32");
    track.keyframes = [];

    if (track.interpolationType === "hermite" || track.interpolationType === "bezier")
        for (let x = 0; x < count; x++) {
            const keyframe = {} as Float32TangentKeyframe;

            keyframe.time = stream.read("i32");
            keyframe.value = stream.read("f32");
            keyframe.inTan = stream.read("f32");
            keyframe.outTan = stream.read("f32");

            track.keyframes.push(keyframe);
        }
    else
        for (let x = 0; x < count; x++) {
            const keyframe = {} as Float32Keyframe;

            keyframe.time = stream.read("i32");
            keyframe.value = stream.read("f32");

            track.keyframes.push(keyframe);
        }

    return track;
}

export { parseFloat32Track, type Float32Track };
