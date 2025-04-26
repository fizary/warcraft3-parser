import { BinaryStream, decode } from "hexcod";
import { UnrecognizedChunkError } from "../errors";
import { parseVec3fTrack, parseVec4fTrack, type Vec3fTrack, type Vec4fTrack } from "./tracks";

const enum NODE_TAGS {
    KGTR = 0x5254474B,
    KGRT = 0x5452474B,
    KGSC = 0x4353474B,
};

const NODE_FLAGS = {
    Helper: 0,
    DontInheritTranslation: 1,
    DontInheritRotation: 2,
    DontInheritScaling: 4,
    Billboarded: 8,
    BillboardedLockX: 16,
    BillboardedLockY: 32,
    BillboardedLockZ: 64,
    CameraAnchored: 128,
    Bone: 256,
    Light: 512,
    EventObject: 1024,
    Attachment: 2048,
    ParticleEmitter: 4096,
    CollisionShape: 8192,
    RibbonEmitter: 16384,
    PEUsesMdlPE2Unshaded: 32768,
    PEUsesTgaPE2SortPrimitivesFarZ: 65536,
    LineEmitter: 131072,
    Unfogged: 262144,
    ModelSpace: 524288,
    XYQuad: 1048576,
} as const;

type NodeTracks = {
    translation?: Vec3fTrack;
    rotation?: Vec4fTrack;
    scaling?: Vec3fTrack;
};

type Node = {
    name: string;
    objectId: number;
    parentId: number;
    flags: number;
    tracks: NodeTracks;
};

function parseNode(stream: BinaryStream): Node {
    const node = {} as Node,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read node fields
    node.name = decode(stream.read("u8", 80));
    node.objectId = stream.read("u32");
    node.parentId = stream.read("u32");
    node.flags = stream.read("u32");

    // Read node tracks
    node.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === NODE_TAGS.KGTR)
            node.tracks.translation = parseVec3fTrack(stream);
        else if (tag === NODE_TAGS.KGRT)
            node.tracks.rotation = parseVec4fTrack(stream);
        else if (tag === NODE_TAGS.KGSC)
            node.tracks.scaling = parseVec3fTrack(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "Node", tag, "KGTR, KGRT, KGSC");
    }

    return node;
}

export { parseNode, NODE_FLAGS, type Node };
