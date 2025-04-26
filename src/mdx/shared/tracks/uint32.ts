import { BinaryStream } from "hexcod";
import { parseInterpolationType } from "../interpolation";

type Uint32Keyframe = {
    time: number;
    value: number;
};

type Uint32TangentKeyframe = {
    time: number;
    value: number;
    inTan: number;
    outTan: number;
};

type Uint32NoInterpolationTrack = {
    interpolationType: "none";
    globalSequenceId: number;
    keyframes: Uint32Keyframe[];
};

type Uint32LinearTrack = {
    interpolationType: "linear";
    globalSequenceId: number;
    keyframes: Uint32Keyframe[];
};

type Uint32HermiteTrack = {
    interpolationType: "hermite";
    globalSequenceId: number;
    keyframes: Uint32TangentKeyframe[];
};

type Uint32BezierTrack = {
    interpolationType: "bezier";
    globalSequenceId: number;
    keyframes: Uint32TangentKeyframe[];
};

type Uint32Track = Uint32NoInterpolationTrack | Uint32LinearTrack | Uint32HermiteTrack | Uint32BezierTrack;

function parseUint32Track(stream: BinaryStream): Uint32Track {
    const track = {} as Uint32Track,
        count = stream.read("u32");

    track.interpolationType = parseInterpolationType(stream);
    track.globalSequenceId = stream.read("u32");
    track.keyframes = [];

    if (track.interpolationType === "hermite" || track.interpolationType === "bezier")
        for (let x = 0; x < count; x++) {
            const keyframe = {} as Uint32TangentKeyframe;

            keyframe.time = stream.read("i32");
            keyframe.value = stream.read("u32");
            keyframe.inTan = stream.read("u32");
            keyframe.outTan = stream.read("u32");

            track.keyframes.push(keyframe);
        }
    else
        for (let x = 0; x < count; x++) {
            const keyframe = {} as Uint32Keyframe;

            keyframe.time = stream.read("i32");
            keyframe.value = stream.read("u32");

            track.keyframes.push(keyframe);
        }

    return track;
}

export { parseUint32Track, type Uint32Track };
