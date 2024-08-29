import { BinaryStream, decode } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";

const enum NodeTag {
    KGTR = 0x5254474B,
    KGRT = 0x5452474B,
    KGSC = 0x4353474B,
}

const enum NodeFlag {
    Helper = 0,
    DontInheritTranslation = 1,
    DontInheritRotation = 2,
    DontInheritScaling = 4,
    Billboarded = 8,
    BillboardedLockX = 16,
    BillboardedLockY = 32,
    BillboardedLockZ = 64,
    CameraAnchored = 128,
    Bone = 256,
    Light = 512,
    EventObject = 1024,
    Attachment = 2048,
    ParticleEmitter = 4096,
    CollisionShape = 8192,
    RibbonEmitter = 16384,
    PEUsesMdlPE2Unshaded = 32768,
    PEUsesTgaPE2SortPrimitivesFarZ = 65536,
    LineEmitter = 131072,
    Unfogged = 262144,
    ModelSpace = 524288,
    XYQuad = 1048576,
}

type NodeTracks = {
    translation?: KeyframeTrack<"vec3f">;
    rotation?: KeyframeTrack<"vec4f">;
    scaling?: KeyframeTrack<"vec3f">;
};

type Node = {
    name: string;
    objectId: number;
    parentId: number;
    flags: number;
    tracks: NodeTracks;
}

function parseNode(stream: BinaryStream): Node {
    const node = {} as Node,
        nextOffset = stream.offset + stream.read("u32") - 4;

    node.name = decode(stream.read("u8", 80));
    node.objectId = stream.read("u32");
    node.parentId = stream.read("u32");
    node.flags = stream.read("u32");
    node.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === NodeTag.KGTR)
            node.tracks.translation = parseKeyframeTrack(stream, "vec3f");
        else if (tag === NodeTag.KGRT)
            node.tracks.rotation = parseKeyframeTrack(stream, "vec4f");
        else if (tag === NodeTag.KGSC)
            node.tracks.scaling = parseKeyframeTrack(stream, "vec3f");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return node;
}

export { parseNode, NodeFlag, type Node };
