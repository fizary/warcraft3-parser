import { BinaryStream } from "hexcod";
import { parseNode, type Node } from "./node.ts";

const enum CollisionShapeType {
    Cube = 0,
    Plane = 1,
    Sphere = 2,
    Cylinder = 3,
}

type CollisionShape = {
    node: Node;
    type: number;
    vertices: Float32Array;
    radius?: number;
}

function parseCollisionShape(stream: BinaryStream): CollisionShape {
    const collisionShape = {} as CollisionShape;

    collisionShape.node = parseNode(stream);
    collisionShape.type = stream.read("u32");
    collisionShape.vertices = stream.read("f32", collisionShape.type === CollisionShapeType.Sphere ? 3 : 6);
    collisionShape.radius = collisionShape.type === CollisionShapeType.Sphere || collisionShape.type === CollisionShapeType.Cylinder ? stream.read("f32") : undefined;

    return collisionShape;
}

export { parseCollisionShape, CollisionShapeType, type CollisionShape };
