import { BinaryStream } from "hexcod";
import { parseAttachment, type Attachment } from "./objects/attachment";
import { parseBone, type Bone } from "./objects/bone";
import { parseCamera, type Camera } from "./objects/camera";
import { parseCollisionShape, type CollisionShape } from "./objects/collisionShape";
import { parseCornEmitter, type CornEmitter } from "./objects/cornEmitter";
import { parseEvent, type Event } from "./objects/event";
import { parseFaceEffect, type FaceEffect } from "./objects/faceEffect";
import { parseGeoset, type Geoset } from "./objects/geoset";
import { parseGeosetAnimation, type GeosetAnimation } from "./objects/geosetAnimation";
import { parseLight, type Light } from "./objects/light";
import { parseMaterial, type Material } from "./objects/material";
import { parseMetadata, type Metadata } from "./objects/metadata";
import { parseParticleEmitter, type ParticleEmitter } from "./objects/particleEmitter";
import { parseParticleEmitter2, type ParticleEmitter2 } from "./objects/particleEmitter2";
import { parseRibbonEmitter, type RibbonEmitter } from "./objects/ribbonEmitter";
import { parseSequence, type Sequence } from "./objects/sequence";
import { parseTexture, type Texture } from "./objects/texture";
import { parseTextureAnimation, type TextureAnimation } from "./objects/textureAnimation";
import { parseNode, type Node } from "./shared/node";
import { MissingMagicBytesError, MissingVersionChunkError, InvalidVersionError, UnrecognizedChunkError } from "./errors";
import { parseArrayChunk } from "./utils";

const enum HEADER_TAGS {
    MDLX = 0x584C444D,
    VERS = 0x53524556,
};

const enum CHUNK_TAGS {
    ATCH = 0x48435441,
    BONE = 0x454E4F42,
    BPOS = 0x534F5042,
    CAMS = 0x534D4143,
    CLID = 0x44494C43,
    CORN = 0x4E524F43,
    EVTS = 0x53545645,
    FAFX = 0x58464146,
    GEOA = 0x414F4547,
    GEOS = 0x534F4547,
    GLBS = 0x53424C47,
    HELP = 0x504C4548,
    LITE = 0x4554494C,
    MODL = 0x4C444F4D,
    MTLS = 0x534C544D,
    PIVT = 0x54564950,
    PREM = 0x4D455250,
    PRE2 = 0x32455250,
    RIBB = 0x42424952,
    SEQS = 0x53514553,
    TEXS = 0x53584554,
    TXAN = 0x4E415854,
};

type Model = {
    attachments?: Attachment[];
    bindPoses?: Float32Array;
    bones?: Bone[];
    cameras?: Camera[];
    collisionShapes?: CollisionShape[];
    cornEmitters?: CornEmitter[];
    events?: Event[];
    faceEffects?: FaceEffect[];
    geosets?: Geoset[];
    geosetAnimations?: GeosetAnimation[];
    globalSequences?: Uint32Array;
    helpers?: Node[];
    lights?: Light[];
    materials?: Material[];
    metadata?: Metadata;
    particleEmitters?: ParticleEmitter[];
    particleEmitters2?: ParticleEmitter2[];
    pivotPoints?: Float32Array;
    ribbonEmitters?: RibbonEmitter[];
    sequences?: Sequence[];
    textureAnimations?: TextureAnimation[];
    textures?: Texture[];
    version: number;
};

function parse(stream: BinaryStream): Model {
    const model = {} as Model;

    // Check magic bytes
    if (stream.read("u32") !== HEADER_TAGS.MDLX)
        throw new MissingMagicBytesError(stream.offset - 4);
    
    // Parse version chunk
    const versionChunk = stream.read("u32", 3);
    model.version = versionChunk[2];

    if (versionChunk[0] !== HEADER_TAGS.VERS)
        throw new MissingVersionChunkError(stream.offset - 12);
    else if (versionChunk[2] > 1000)
        throw new InvalidVersionError(stream.offset - 4, versionChunk[2], "800, 900, 1000");

    // Parse optional chunks
    while (stream.remaining > 0) {
        const tag = stream.read("u32");
        const size = stream.read("u32");
        const nextChunkOffset = stream.offset + size;

        if (tag === CHUNK_TAGS.ATCH)
            model.attachments = parseArrayChunk(parseAttachment, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.BONE)
            model.bones = parseArrayChunk(parseBone, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.BPOS && model.version >= 900)
            model.bindPoses = stream.read("f32", stream.read("u32") * 12);
        else if (tag === CHUNK_TAGS.CAMS)
            model.cameras = parseArrayChunk(parseCamera, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.CLID)
            model.collisionShapes = parseArrayChunk(parseCollisionShape, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.CORN && model.version >= 900)
            model.cornEmitters = parseArrayChunk(parseCornEmitter, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.EVTS)
            model.events = parseArrayChunk(parseEvent, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.FAFX && model.version >= 900)
            model.faceEffects = parseArrayChunk(parseFaceEffect, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.GEOA)
            model.geosetAnimations = parseArrayChunk(parseGeosetAnimation, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.GEOS)
            model.geosets = parseArrayChunk(parseGeoset, nextChunkOffset, stream, model.version);
        else if (tag === CHUNK_TAGS.GLBS)
            model.globalSequences = stream.read("u32", size / 4);
        else if (tag === CHUNK_TAGS.HELP)
            model.helpers = parseArrayChunk(parseNode, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.LITE)
            model.lights = parseArrayChunk(parseLight, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.MODL)
            model.metadata = parseMetadata(stream);
        else if (tag === CHUNK_TAGS.MTLS)
            model.materials = parseArrayChunk(parseMaterial, nextChunkOffset, stream, model.version);
        else if (tag === CHUNK_TAGS.PIVT)
            model.pivotPoints = stream.read("f32", size / 12 * 3);
        else if (tag === CHUNK_TAGS.PREM)
            model.particleEmitters = parseArrayChunk(parseParticleEmitter, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.PRE2)
            model.particleEmitters2 = parseArrayChunk(parseParticleEmitter2, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.RIBB)
            model.ribbonEmitters = parseArrayChunk(parseRibbonEmitter, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.SEQS)
            model.sequences = parseArrayChunk(parseSequence, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.TEXS)
            model.textures = parseArrayChunk(parseTexture, nextChunkOffset, stream);
        else if (tag === CHUNK_TAGS.TXAN)
            model.textureAnimations = parseArrayChunk(parseTextureAnimation, nextChunkOffset, stream);
        else {
            console.warn(
                new UnrecognizedChunkError(
                    stream.offset - 8,
                    "Model",
                    tag,
                    model.version >= 900
                        ? "ATCH, BONE, BPOS, CAMS, CLID, CORN, EVTS, FAFX, GEOA, GEOS, GLBS, HELP, LITE, MODL, MTLS, PIVT, PREM, PRE2, RIBB, SEQS, TEXS, TXAN"
                        : "ATCH, BONE, CAMS, CLID, EVTS, GEOA, GEOS, GLBS, HELP, LITE, MODL, MTLS, PIVT, PREM, PRE2, RIBB, SEQS, TEXS, TXAN",
                ),
            );
            stream.seek(nextChunkOffset);
        }
    }

    return model;
}

export { parse, type Model };
