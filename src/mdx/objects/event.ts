import { BinaryStream } from "hexcod";
import { parseNode, type Node } from "./node.ts";
import { parseTrack, type Track } from "./track.ts";

const enum EventTag {
    KEVT = 0x5456454B,
}

type EventTracks = {
    // @NOTE: Not sure what is the purpose of this track, so for now it's named same as tag
    kevt?: Track<"uint32">;
};

type Event = {
    node: Node;
    tracks: EventTracks;
}

function parseEvent(stream: BinaryStream): Event {
    const event = {} as Event;

    event.node = parseNode(stream);
    event.tracks = {};

    if (stream.read("u32") !== EventTag.KEVT)
        throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);

    event.tracks.kevt = parseTrack(stream, "uint32");

    return event;
}

export { parseEvent, type Event };
