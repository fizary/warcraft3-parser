import { BinaryStream } from "hexcod";
import { parseAttachment, type Attachment } from "./objects/attachment.ts";
import { parseBone, type Bone } from "./objects/bone.ts";
import { parseCamera, type Camera } from "./objects/camera.ts";
import { parseCollisionShape, type CollisionShape } from "./objects/collisionShape.ts";
import { parseCornEmitter, type CornEmitter } from "./objects/cornEmitter.ts";
import { parseEvent, type Event } from "./objects/event.ts";
import { parseFaceEffect, type FaceEffect } from "./objects/faceEffect.ts";
import { parseGeoset, type Geoset } from "./objects/geoset.ts";
import { parseGeosetAnimation, type GeosetAnimation } from "./objects/geosetAnimation.ts";
import { parseLight, type Light } from "./objects/light.ts";
import { parseMaterial, type Material } from "./objects/material.ts";
import { parseMetadata, type Metadata } from "./objects/metadata.ts";
import { parseNode, type Node } from "./objects/node.ts";
import { parseParticleEmitter, type ParticleEmitter } from "./objects/particleEmitter.ts";
import { parsePatricleEmitter2, type ParticleEmitter2 } from "./objects/particleEmitter2.ts";
import { parseRibbonEmitter, type RibbonEmitter } from "./objects/ribbonEmitter.ts";
import { parseSequence, type Sequence } from "./objects/sequence.ts";
import { parseTexture, type Texture } from "./objects/texture.ts";
import { parseTextureAnimation, type TextureAnimation } from "./objects/textureAnimation.ts";

const enum ChunkTag {
    MDLX = 0x584C444D,
    VERS = 0x53524556,
    MODL = 0x4C444F4D,
    SEQS = 0x53514553,
    GLBS = 0x53424C47,
    TEXS = 0x53584554,
    MTLS = 0x534C544D,
    TXAN = 0x4E415854,
    GEOS = 0x534F4547,
    GEOA = 0x414F4547,
    BONE = 0x454E4F42,
    LITE = 0x4554494C,
    HELP = 0x504C4548,
    ATCH = 0x48435441,
    PIVT = 0x54564950,
    PREM = 0x4D455250,
    PRE2 = 0x32455250,
    RIBB = 0x42424952,
    EVTS = 0x53545645,
    CAMS = 0x534D4143,
    CLID = 0x44494C43,
    BPOS = 0x534F5042,
    FAFX = 0x58464146,
    CORN = 0x4E524F43,
}

type Model = {
    metadata?: Metadata;
    sequences: Sequence[];
    globalSequences?: Uint32Array;
    textures: Texture[];
    materials: Material[];
    textureAnimations: TextureAnimation[];
    geosets: Geoset[];
    geosetAnimations: GeosetAnimation[];
    bones: Bone[];
    lights: Light[];
    helpers: Node[];
    attachments: Attachment[];
    pivotPoints?: Float32Array;
    particleEmitters: ParticleEmitter[];
    particleEmitters2: ParticleEmitter2[];
    ribbonEmitters: RibbonEmitter[];
    events: Event[];
    cameras: Camera[];
    collisionShapes: CollisionShape[];
    bindPoses?: Float32Array;
    faceEffects: FaceEffect[];
    cornEmitters: CornEmitter[];
}

function parse(stream: BinaryStream): Model {
    if (stream.read("u32") !== ChunkTag.MDLX)
        throw new Error("Buffer does not contain MDX magic bytes.");
    else if (stream.read("u32") !== ChunkTag.VERS)
        throw new Error(`Missing VERS tag at ${ stream.offset - 4 } bytes offset.`);
    else if (stream.read("u32", 2)[1] !== 1000)
        throw new Error("Parsing MDX with version different than 1000 is not supported.");

    const model: Model = {
        sequences: [],
        textures: [],
        materials: [],
        textureAnimations: [],
        geosets: [],
        geosetAnimations: [],
        bones: [],
        lights: [],
        helpers: [],
        attachments: [],
        particleEmitters: [],
        particleEmitters2: [],
        ribbonEmitters: [],
        events: [],
        cameras: [],
        collisionShapes: [],
        faceEffects: [],
        cornEmitters: [],
    };

    let nextChunkOffset = 0,
        tag = -1,
        size = -1;

    while (stream.remaining > 0) {
        if (stream.offset >= nextChunkOffset) {
            tag = stream.read("u32");
            size = stream.read("u32");
            nextChunkOffset = stream.offset + size;
        }

        if (tag === ChunkTag.MODL)
            model.metadata = parseMetadata(stream);
        else if (tag === ChunkTag.SEQS)
            model.sequences.push(parseSequence(stream));
        else if (tag === ChunkTag.GLBS)
            model.globalSequences = stream.read("u32", size / 4);
        else if (tag === ChunkTag.TEXS)
            model.textures.push(parseTexture(stream));
        else if (tag === ChunkTag.MTLS)
            model.materials.push(parseMaterial(stream));
        else if (tag === ChunkTag.TXAN)
            model.textureAnimations.push(parseTextureAnimation(stream));
        else if (tag === ChunkTag.GEOS)
            model.geosets.push(parseGeoset(stream));
        else if (tag === ChunkTag.GEOA)
            model.geosetAnimations.push(parseGeosetAnimation(stream));
        else if (tag === ChunkTag.BONE)
            model.bones.push(parseBone(stream));
        else if (tag === ChunkTag.LITE)
            model.lights.push(parseLight(stream));
        else if (tag === ChunkTag.HELP)
            model.helpers.push(parseNode(stream));
        else if (tag === ChunkTag.ATCH)
            model.attachments.push(parseAttachment(stream));
        else if (tag === ChunkTag.PIVT)
            model.pivotPoints = stream.read("f32", size / 12 * 3);
        else if (tag === ChunkTag.PREM)
            model.particleEmitters.push(parseParticleEmitter(stream));
        else if (tag === ChunkTag.PRE2)
            model.particleEmitters2.push(parsePatricleEmitter2(stream));
        else if (tag === ChunkTag.RIBB)
            model.ribbonEmitters.push(parseRibbonEmitter(stream));
        else if (tag === ChunkTag.EVTS)
            model.events.push(parseEvent(stream));
        else if (tag === ChunkTag.CAMS)
            model.cameras.push(parseCamera(stream));
        else if (tag === ChunkTag.CLID)
            model.collisionShapes.push(parseCollisionShape(stream));
        else if (tag === ChunkTag.BPOS)
            model.bindPoses = stream.read("f32", stream.read("u32") * 12);
        else if (tag === ChunkTag.FAFX)
            model.faceEffects.push(parseFaceEffect(stream));
        else if (tag === ChunkTag.CORN)
            model.cornEmitters.push(parseCornEmitter(stream));
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 8 }`);
    }

    return model;
}

export { parse, type Model };
