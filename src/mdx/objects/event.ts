import { BinaryStream } from "hexcod";
import { MissingChunkError } from "../errors";
import { parseNode, type Node } from "../shared/node";

const enum EVENT_TAGS {
    KEVT = 0x5456454B,
};

type Event = {
    node: Node;
    globalSequenceId: number;
    value: Uint32Array;
};

function parseEvent(stream: BinaryStream): Event {
    const event = {} as Event;

    // Read event fields
    event.node = parseNode(stream);

    // Read event keys
    if (stream.read("u32") !== EVENT_TAGS.KEVT)
        throw new MissingChunkError(stream.offset - 4, "Event", "KEVT");

    const count = stream.read("u32");
    event.globalSequenceId = stream.read("u32");
    event.value = stream.read("u32", count);

    return event;
}

export { parseEvent, type Event };
