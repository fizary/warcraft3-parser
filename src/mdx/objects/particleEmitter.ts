import { BinaryStream, decode } from "hexcod";
import { parseKeyframeTrack, type KeyframeTrack } from "./keyframes.ts";
import { parseNode, type Node } from "./node.ts";

const enum ParticleEmitterTag {
    KPEE = 0x4545504B,
    KPEG = 0x4745504B,
    KPLN = 0x4E4C504B,
    KPLT = 0x544C504B,
    KPEL = 0x4C45504B,
    KPES = 0x5345504B,
    KPEV = 0x5645504B,
}

type ParticleEmitterTracks = {
    emissionRate?: KeyframeTrack<"float32">;
    gravity?: KeyframeTrack<"float32">;
    longitude?: KeyframeTrack<"float32">;
    latitude?: KeyframeTrack<"float32">;
    lifespan?: KeyframeTrack<"float32">;
    speed?: KeyframeTrack<"float32">;
    visibility?: KeyframeTrack<"float32">;
}

type ParticleEmitter = {
    node: Node;
    emissionRate: number;
    gravity: number;
    longitude: number;
    latitude: number;
    spawnModelFileName: string;
    lifespan: number;
    initialVelocity: number;
    tracks: ParticleEmitterTracks;
}

function parseParticleEmitter(stream: BinaryStream): ParticleEmitter {
    const particleEmitter = {} as ParticleEmitter,
        nextOffset = stream.offset + stream.read("u32") - 4;

    particleEmitter.node = parseNode(stream);
    particleEmitter.emissionRate = stream.read("f32");
    particleEmitter.gravity = stream.read("f32");
    particleEmitter.longitude = stream.read("f32");
    particleEmitter.latitude = stream.read("f32");
    particleEmitter.spawnModelFileName = decode(stream.read("u8", 260));
    particleEmitter.lifespan = stream.read("f32");
    particleEmitter.initialVelocity = stream.read("f32");
    particleEmitter.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === ParticleEmitterTag.KPEE)
            particleEmitter.tracks.emissionRate = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitterTag.KPEG)
            particleEmitter.tracks.gravity = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitterTag.KPLN)
            particleEmitter.tracks.longitude = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitterTag.KPLT)
            particleEmitter.tracks.latitude = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitterTag.KPEL)
            particleEmitter.tracks.lifespan = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitterTag.KPES)
            particleEmitter.tracks.speed = parseKeyframeTrack(stream, "float32");
        else if (tag === ParticleEmitterTag.KPEV)
            particleEmitter.tracks.visibility = parseKeyframeTrack(stream, "float32");
        else
            throw new Error(`Invalid tag found at offset ${ stream.offset - 4 }`);
    }

    return particleEmitter;
}

export { parseParticleEmitter, type ParticleEmitter };
