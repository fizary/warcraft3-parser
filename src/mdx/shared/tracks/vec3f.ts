import { BinaryStream } from "hexcod";
import { parseInterpolationType } from "../interpolation";

type Vec3fKeyframe = {
    time: number;
    value: Float32Array;
};

type Vec3fTangentKeyframe = {
    time: number;
    value: Float32Array;
    inTan: Float32Array;
    outTan: Float32Array;
};

type Vec3fNoInterpolationTrack = {
    interpolationType: "none";
    globalSequenceId: number;
    keyframes: Vec3fKeyframe[];
};

type Vec3fLinearTrack = {
    interpolationType: "linear";
    globalSequenceId: number;
    keyframes: Vec3fKeyframe[];
};

type Vec3fHermiteTrack = {
    interpolationType: "hermite";
    globalSequenceId: number;
    keyframes: Vec3fTangentKeyframe[];
};

type Vec3fBezierTrack = {
    interpolationType: "bezier";
    globalSequenceId: number;
    keyframes: Vec3fTangentKeyframe[];
};

type Vec3fTrack = Vec3fNoInterpolationTrack | Vec3fLinearTrack | Vec3fHermiteTrack | Vec3fBezierTrack;

function parseVec3fTrack(stream: BinaryStream): Vec3fTrack {
    const track = {} as Vec3fTrack,
        count = stream.read("u32");

    track.interpolationType = parseInterpolationType(stream);
    track.globalSequenceId = stream.read("u32");
    track.keyframes = [];

    if (track.interpolationType === "hermite" || track.interpolationType === "bezier")
        for (let x = 0; x < count; x++) {
            const keyframe = {} as Vec3fTangentKeyframe;

            keyframe.time = stream.read("i32");
            keyframe.value = stream.read("f32", 3);
            keyframe.inTan = stream.read("f32", 3);
            keyframe.outTan = stream.read("f32", 3);

            track.keyframes.push(keyframe);
        }
    else
        for (let x = 0; x < count; x++) {
            const keyframe = {} as Vec3fKeyframe;

            keyframe.time = stream.read("i32");
            keyframe.value = stream.read("f32", 3);

            track.keyframes.push(keyframe);
        }

    return track;
}

export { parseVec3fTrack, type Vec3fTrack };
