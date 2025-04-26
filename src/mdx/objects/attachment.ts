import { BinaryStream, decode } from "hexcod";
import { UnrecognizedChunkError } from "../errors";
import { parseNode, type Node } from "../shared/node";
import { parseFloat32Track, type Float32Track } from "../shared/tracks";

const enum ATTACHMENT_TAGS {
    KATV = 0x5654414B,
};

type AttachmentTracks = {
    visibility?: Float32Track;
};

type Attachment = {
    node: Node;
    path: string;
    attachmentId: number;
    tracks: AttachmentTracks;
};

function parseAttachment(stream: BinaryStream): Attachment {
    const attachment = {} as Attachment,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read attachment fields
    attachment.node = parseNode(stream);
    attachment.path = decode(stream.read("u8", 260));
    attachment.attachmentId = stream.read("u32");

    // Read attachment tracks
    attachment.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === ATTACHMENT_TAGS.KATV)
            attachment.tracks.visibility = parseFloat32Track(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "Attachment", tag, "KATV");
    }

    return attachment;
}

export { parseAttachment, type Attachment };
