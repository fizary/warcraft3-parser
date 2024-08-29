import { BinaryStream, decode } from "hexcod";
import { parseExtent, type Extent } from "./extent.ts";
import { parseSimpleTrack } from "./track.ts";

const enum GeosetTag {
    VRTX = 0x58545256,
    NRMS = 0x534D524E,
    PTYP = 0x50595450,
    PCNT = 0x544E4350,
    PVTX = 0x58545650,
    GNDX = 0x58444E47,
    MTGC = 0x4347544D,
    MATS = 0x5354414D,
    TANG = 0x474E4154,
    SKIN = 0x4E494B53,
    UVAS = 0x53415655,
    UVBS = 0x53425655,
}

const enum GeosetFaceType {
    Point = 0,
    Line = 1,
    LineLoop = 2,
    LineStrip = 3,
    Triangle = 4,
    TriangleStrip = 5,
    TriangleFan = 6,
    Quad = 7,
    QuadStrip = 8,
    Polygon = 9,
}

const enum GeosetSelectionFlag {
    None = 0,
    Unselectable = 4,
}

type Geoset = {
    vertexPositions: Float32Array;
    vertexNormals: Float32Array;
    faceTypeGroups: Uint32Array;
    faceGroups: Uint32Array;
    faces: Uint16Array;
    vertexGroups: Uint8Array;
    matrixGroups: Uint32Array;
    matrixIndices: Uint32Array;
    materialId: number;
    selectionGroup: number;
    selectionFlags: number;
    levelOfDetail: number;
    name: string;
    extent: Extent;
    sequenceExtents: Extent[];
    tangents: Float32Array;
    skin: Uint8Array;
    textureCoordinates: Float32Array[];
}

function parseGeoset(stream: BinaryStream): Geoset {
    const geoset = {} as Geoset,
        nextOffset = stream.offset + stream.read("u32") - 4;

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === GeosetTag.VRTX)
            geoset.vertexPositions = parseSimpleTrack(stream, "vec3f");
        else if (tag === GeosetTag.NRMS)
            geoset.vertexNormals = parseSimpleTrack(stream, "vec3f");
        else if (tag === GeosetTag.PTYP)
            geoset.faceTypeGroups = parseSimpleTrack(stream, "uint32");
        else if (tag === GeosetTag.PCNT)
            geoset.faceGroups = parseSimpleTrack(stream, "uint32");
        else if (tag === GeosetTag.PVTX)
            geoset.faces = parseSimpleTrack(stream, "uint16");
        else if (tag === GeosetTag.GNDX)
            geoset.vertexGroups = parseSimpleTrack(stream, "uint8");
        else if (tag === GeosetTag.MTGC)
            geoset.matrixGroups = parseSimpleTrack(stream, "uint32");
        else if (tag === GeosetTag.MATS) {
            geoset.matrixIndices = parseSimpleTrack(stream, "uint32");
            geoset.materialId = stream.read("u32");
            geoset.selectionGroup = stream.read("u32");
            geoset.selectionFlags = stream.read("u32");
            geoset.levelOfDetail = stream.read("u32");
            geoset.name = decode(stream.read("u8", 80));
            geoset.extent = parseExtent(stream);

            geoset.sequenceExtents = [];
            for (let x = 0, count = stream.read("u32"); x < count; x++)
                geoset.sequenceExtents.push(parseExtent(stream));
        } else if (tag === GeosetTag.TANG)
            geoset.tangents = parseSimpleTrack(stream, "vec4f");
        else if (tag === GeosetTag.SKIN)
            geoset.skin = parseSimpleTrack(stream, "uint8");
        else if (tag === GeosetTag.UVAS) {
            geoset.textureCoordinates = [];

            for (let x = 0, count = stream.read("u32"); x < count; x++) {
                if (stream.read("u32") !== GeosetTag.UVBS)
                    throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);

                geoset.textureCoordinates.push(parseSimpleTrack(stream, "vec2f"));
            }
        } else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return geoset;
}

export { parseGeoset, GeosetFaceType, GeosetSelectionFlag, type Geoset };
