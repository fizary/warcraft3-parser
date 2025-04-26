import { BinaryStream, decode } from "hexcod";
import { MissingChunkError, UnrecognizedChunkError, UnrecognizedValueError } from "../errors";
import { parseExtent, type Extent } from "../shared/extent";

const enum GEOSET_TAGS {
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
};

const GEOSET_SELECTION_FLAGS = {
    None: 0,
    Unselectable: 4,
} as const;

type FaceType = "point" | "line" | "line-loop" | "line-strip" | "triangle" | "triangle-strip" | "triangle-fan" | "quad" | "quad-strip" | "polygon";

type Geoset = {
    vertexPositions: Float32Array;
    vertexNormals: Float32Array;
    faceTypeGroups: FaceType[];
    faceGroups: Uint32Array;
    faces: Uint16Array;
    vertexGroups: Uint8Array;
    matrixGroups: Uint32Array;
    matrixIndices: Uint32Array;
    materialId: number;
    selectionGroup: number;
    selectionFlags: number;
    levelOfDetail?: number;
    name?: string;
    extent: Extent;
    sequenceExtents: Extent[];
    tangents?: Float32Array;
    skin?: Uint8Array;
    textureCoordinates: Float32Array[];
};

function stringifyFaceTypeGroups(faceTypeGroups: Uint32Array, currentOffset: number): FaceType[] {
    const values = new Array(faceTypeGroups.length);

    for (let x = 0; x < faceTypeGroups.length; x++) {
        switch (faceTypeGroups[x]) {
            case 0:
                values[x] = "point";
                break;
            case 1:
                values[x] = "line";
                break;
            case 2:
                values[x] = "line-loop";
                break;
            case 3:
                values[x] = "line-strip";
                break;
            case 4:
                values[x] = "triangle";
                break;
            case 5:
                values[x] = "triangle-strip";
                break;
            case 6:
                values[x] = "triangle-fan";
                break;
            case 7:
                values[x] = "quad";
                break;
            case 8:
                values[x] = "quad-strip";
                break;
            case 9:
                values[x] = "polygon";
                break;
            default:
                throw new UnrecognizedValueError(currentOffset - ((faceTypeGroups.length - x) * 4), "Geoset", "faceTypeGroups", faceTypeGroups[x], "0 = point, 1 = line, 2 = line-loop, 3 = line-strip, 4 = triangle, 5 = triangle-strip, 6 = triangle-fan, 7 = quad, 8 = quad-strip, 9 = polygon");
        }
    }

    return values;
}

function parseGeoset(stream: BinaryStream, version: number): Geoset {
    const geoset = {} as Geoset;

    // Skip inclusive size
    stream.skip(4);

    // Read vertices
    if (stream.read("u32") !== GEOSET_TAGS.VRTX)
        throw new MissingChunkError(stream.offset - 4, "Geoset", "VRTX");

    geoset.vertexPositions = stream.read("f32", stream.read("u32") * 3);

    // Read normals
    if (stream.read("u32") !== GEOSET_TAGS.NRMS)
        throw new MissingChunkError(stream.offset - 4, "Geoset", "NRMS");

    geoset.vertexNormals = stream.read("f32", stream.read("u32") * 3);

    // Read face type groups
    if (stream.read("u32") !== GEOSET_TAGS.PTYP)
        throw new MissingChunkError(stream.offset - 4, "Geoset", "PTYP");

    geoset.faceTypeGroups = stringifyFaceTypeGroups(stream.read("u32", stream.read("u32")), stream.offset);

    // Read face groups
    if (stream.read("u32") !== GEOSET_TAGS.PCNT)
        throw new MissingChunkError(stream.offset - 4, "Geoset", "PCNT");

    geoset.faceGroups = stream.read("u32", stream.read("u32"));

    // Read faces
    if (stream.read("u32") !== GEOSET_TAGS.PVTX)
        throw new MissingChunkError(stream.offset - 4, "Geoset", "PVTX");

    geoset.faces = stream.read("u16", stream.read("u32"));

    // Read vertex groups
    if (stream.read("u32") !== GEOSET_TAGS.GNDX)
        throw new MissingChunkError(stream.offset - 4, "Geoset", "GNDX");

    geoset.vertexGroups = stream.read("u8", stream.read("u32"));

    // Read matrix groups
    if (stream.read("u32") !== GEOSET_TAGS.MTGC)
        throw new MissingChunkError(stream.offset - 4, "Geoset", "MTGC");

    geoset.matrixGroups = stream.read("u32", stream.read("u32"));

    // Read matrix indices
    if (stream.read("u32") !== GEOSET_TAGS.MATS)
        throw new MissingChunkError(stream.offset - 4, "Geoset", "MATS");

    geoset.matrixIndices = stream.read("u32", stream.read("u32"));

    // Read geoset metadata
    geoset.materialId = stream.read("u32");
    geoset.selectionGroup = stream.read("u32");
    geoset.selectionFlags = stream.read("u32");

    if (version >= 900) {
        geoset.levelOfDetail = stream.read("u32");
        geoset.name = decode(stream.read("u8", 80));
    }

    // Read extents
    geoset.extent = parseExtent(stream);
    geoset.sequenceExtents = [];

    for (let x = 0, count = stream.read("u32"); x < count; x++)
        geoset.sequenceExtents.push(parseExtent(stream));

    // Read optional chunks
    if (version >= 900) {
        let tag: number;

        while (tag = stream.read("u32"), tag !== GEOSET_TAGS.UVAS) {
            if (tag === GEOSET_TAGS.TANG)
                geoset.tangents = stream.read("f32", stream.read("u32") * 4);
            else if (tag === GEOSET_TAGS.SKIN)
                geoset.skin = stream.read("u8", stream.read("u32"));
            else
                throw new UnrecognizedChunkError(stream.offset - 4, "Geoset", tag, "TANG, SKIN");
        }

        // Revert last stream read, which performed look ahead
        stream.seek(stream.offset - 4);
    }

    // Read texture coordinates
    geoset.textureCoordinates = [];

    if (stream.read("u32") !== GEOSET_TAGS.UVAS)
        throw new MissingChunkError(stream.offset - 4, "Geoset", "UVAS");

    for (let x = 0, count = stream.read("u32"); x < count; x++) {
        if (stream.read("u32") !== GEOSET_TAGS.UVBS)
            throw new MissingChunkError(stream.offset - 4, "Geoset", "UVBS");

        geoset.textureCoordinates.push(stream.read("f32", stream.read("u32") * 2));
    }

    return geoset;
}

export { parseGeoset, GEOSET_SELECTION_FLAGS, type Geoset };
