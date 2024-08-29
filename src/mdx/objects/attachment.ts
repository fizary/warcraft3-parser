import { BinaryStream, decode } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";
import { parseNode, type Node } from "./node.ts";

const enum AttachmentTag {
    KATV = 0x5654414B,
}

type AttachmentTracks = {
    visibility?: KeyframeTrack<"float32">;
}

type Attachment = {
    node: Node;
    path: string;
    attachmentId: number;
    tracks: AttachmentTracks;
}

function parseAttachment(stream: BinaryStream): Attachment {
    const attachment = {} as Attachment,
        nextOffset = stream.offset + stream.read("u32") - 4;

    attachment.node = parseNode(stream);
    attachment.path = decode(stream.read("u8", 260));
    attachment.attachmentId = stream.read("u32");
    attachment.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === AttachmentTag.KATV)
            attachment.tracks.visibility = parseKeyframeTrack(stream, "float32");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return attachment;
}

export { parseAttachment, type Attachment };
