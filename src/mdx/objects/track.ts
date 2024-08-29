import { BinaryStream } from "hexcod";

type TrackType = "uint8" | "uint16" | "uint32" | "vec2f" | "vec3f" | "vec4f";

type TrackValue<T extends TrackType> =
    T extends "vec2f" | "vec3f" | "vec4f"
    ? Float32Array
    : T extends "uint8"
    ? Uint8Array
    : T extends "uint16"
    ? Uint16Array
    : T extends "uint32"
    ? Uint32Array
    : never;

type Track<T extends TrackType> = {
    globalSequenceId: number;
    value: TrackValue<T>;
}

type SimpleTrack<T extends TrackType> = TrackValue<T>;

function parseTrackValue<T extends TrackType>(stream: BinaryStream, type: T, count: number): TrackValue<T> {
    return (
        type === "vec2f" ? stream.read("f32", count * 2)
        : type === "vec3f" ? stream.read("f32", count * 3)
        : type === "vec4f" ? stream.read("f32", count * 4)
        : type === "uint8" ? stream.read("u8", count)
        : type === "uint16" ? stream.read("u16", count)
        : type === "uint32" ? stream.read("u32", count)
        : undefined
    ) as TrackValue<T>;
}

function parseTrack<T extends TrackType>(stream: BinaryStream, type: T): Track<T> {
    const track = {} as Track<T>,
        count = stream.read("u32");

    track.globalSequenceId = stream.read("u32");
    track.value = parseTrackValue(stream, type, count);

    return track;
}

function parseSimpleTrack<T extends TrackType>(stream: BinaryStream, type: T): SimpleTrack<T> {
    const count = stream.read("u32");
    return parseTrackValue(stream, type, count);
}

export { parseTrack, parseSimpleTrack, type Track, type SimpleTrack };
