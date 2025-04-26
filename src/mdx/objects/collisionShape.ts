import { BinaryStream } from "hexcod";
import { UnrecognizedValueError } from "../errors";
import { parseNode, type Node } from "../shared/node";

type CollisionShapeCube = {
    type: "cube";
    node: Node;
    vertices: Float32Array;
};

type CollisionShapePlane = {
    type: "plane";
    node: Node;
    vertices: Float32Array;
};

type CollisionShapeSphere = {
    type: "sphere";
    node: Node;
    vertices: Float32Array;
    radius: number;
};

type CollisionShapeCylinder = {
    type: "cylinder";
    node: Node;
    vertices: Float32Array;
    radius: number;
};

type CollisionShape = CollisionShapeCube | CollisionShapePlane | CollisionShapeSphere | CollisionShapeCylinder;

function stringifyType(type: number, currentOffset: number): CollisionShape["type"] {
    switch (type) {
        case 0:
            return "cube";
        case 1:
            return "plane";
        case 2:
            return "sphere";
        case 3:
            return "cylinder";
        default:
            throw new UnrecognizedValueError(currentOffset - 4, "CollisionShape", "type", type, "0 = cube, 1 = plane, 2 = sphere, 3 = cylinder");
    }
}

function parseCollisionShape(stream: BinaryStream): CollisionShape {
    const collisionShape = {} as CollisionShape;

    // Read collision shape fields
    collisionShape.node = parseNode(stream);
    collisionShape.type = stringifyType(stream.read("u32"), stream.offset);
    collisionShape.vertices = stream.read("f32", collisionShape.type === "sphere" ? 3 : 6);

    if (collisionShape.type === "sphere" || collisionShape.type === "cylinder")
        collisionShape.radius = stream.read("f32");

    return collisionShape;
}

export { parseCollisionShape, type CollisionShape };
