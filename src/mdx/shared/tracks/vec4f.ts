import { BinaryStream } from "hexcod";
import { parseInterpolationType } from "../interpolation";

type Vec4fKeyframe = {
    time: number;
    value: Float32Array;
};

type Vec4fTangentKeyframe = {
    time: number;
    value: Float32Array;
    inTan: Float32Array;
    outTan: Float32Array;
};

type Vec4fNoInterpolationTrack = {
    interpolationType: "none";
    globalSequenceId: number;
    keyframes: Vec4fKeyframe[];
};

type Vec4fLinearTrack = {
    interpolationType: "linear";
    globalSequenceId: number;
    keyframes: Vec4fKeyframe[];
};

type Vec4fHermiteTrack = {
    interpolationType: "hermite";
    globalSequenceId: number;
    keyframes: Vec4fTangentKeyframe[];
};

type Vec4fBezierTrack = {
    interpolationType: "bezier";
    globalSequenceId: number;
    keyframes: Vec4fTangentKeyframe[];
};

type Vec4fTrack = Vec4fNoInterpolationTrack | Vec4fLinearTrack | Vec4fHermiteTrack | Vec4fBezierTrack;

function parseVec4fTrack(stream: BinaryStream): Vec4fTrack {
    const track = {} as Vec4fTrack,
        count = stream.read("u32");

    track.interpolationType = parseInterpolationType(stream);
    track.globalSequenceId = stream.read("u32");
    track.keyframes = [];

    if (track.interpolationType === "hermite" || track.interpolationType === "bezier")
        for (let x = 0; x < count; x++) {
            const keyframe = {} as Vec4fTangentKeyframe;

            keyframe.time = stream.read("i32");
            keyframe.value = stream.read("f32", 4);
            keyframe.inTan = stream.read("f32", 4);
            keyframe.outTan = stream.read("f32", 4);

            track.keyframes.push(keyframe);
        }
    else
        for (let x = 0; x < count; x++) {
            const keyframe = {} as Vec4fKeyframe;

            keyframe.time = stream.read("i32");
            keyframe.value = stream.read("f32", 4);

            track.keyframes.push(keyframe);
        }

    return track;
}

export { parseVec4fTrack, type Vec4fTrack };
