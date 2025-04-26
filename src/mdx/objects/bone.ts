import { BinaryStream } from "hexcod";
import { parseNode, type Node } from "../shared/node";

type Bone = {
    node: Node;
    geosetId: number;
    geosetAnimationId: number;
};

function parseBone(stream: BinaryStream): Bone {
    const bone = {} as Bone;

    // Read bone fields
    bone.node = parseNode(stream);
    bone.geosetId = stream.read("u32");
    bone.geosetAnimationId = stream.read("u32");

    return bone;
}

export { parseBone, type Bone };
