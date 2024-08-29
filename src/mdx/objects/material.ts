import { BinaryStream, decode } from "hexcod";
import { parseLayer, type Layer } from "./layer.ts";

const enum MaterialTag {
    LAYS = 0x5359414C,
}

const enum MaterialRenderMode {
    None = 0,
    ConstantColor = 1,
    SortPrimitivesNearZ = 8,
    SortPrimitivesFarZ = 16,
    FullResolution = 32,
}

type Material = {
    priorityPlane: number;
    renderMode: number;
    shader: string;
    layers: Layer[];
}

function parseMaterial(stream: BinaryStream): Material {
    const material = {} as Material,
        nextOffset = stream.offset + stream.read("u32") - 4;

    material.priorityPlane = stream.read("u32");
    material.renderMode = stream.read("u32");
    material.shader = decode(stream.read("u8", 80));
    material.layers = [];

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === MaterialTag.LAYS)
            for (let x = 0, count = stream.read("u32"); x < count; x++)
                material.layers.push(parseLayer(stream));
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return material;
}

export { parseMaterial, MaterialRenderMode, type Material };
