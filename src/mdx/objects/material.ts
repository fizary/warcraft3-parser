import { BinaryStream, decode } from "hexcod";
import { MissingChunkError } from "../errors";
import { parseLayer, type Layer } from "./layer";

const enum MATERIAL_TAGS {
    LAYS = 0x5359414C,
};

const MATERIAL_RENDER_FLAGS = {
    None: 0,
    ConstantColor: 1,
    SortPrimitivesNearZ: 8,
    SortPrimitivesFarZ: 16,
    FullResolution: 32,
} as const;

type Material = {
    priorityPlane: number;
    renderFlags: number;
    shader?: string;
    layers: Layer[];
};

function parseMaterial(stream: BinaryStream, version: number): Material {
    const material = {} as Material;

    // Skip inclusive size
    stream.skip(4);

    // Read material fields
    material.priorityPlane = stream.read("u32");
    material.renderFlags = stream.read("u32");

    if (version >= 900)
        material.shader = decode(stream.read("u8", 80));

    // Read layers
    material.layers = [];

    if (stream.read("u32") !== MATERIAL_TAGS.LAYS)
        throw new MissingChunkError(stream.offset - 4, "Material", "LAYS");

    for (let x = 0, count = stream.read("u32"); x < count; x++)
        material.layers.push(parseLayer(stream, version));

    return material;
}

export { parseMaterial, MATERIAL_RENDER_FLAGS, type Material };
