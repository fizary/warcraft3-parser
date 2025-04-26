import { BinaryStream, decode } from "hexcod";
import { UnrecognizedChunkError } from "../errors";
import { parseNode, type Node } from "../shared/node";
import { parseFloat32Track, type Float32Track } from "../shared/tracks";

const enum PARTICLE_EMITTER_TAGS {
    KPEE = 0x4545504B,
    KPEG = 0x4745504B,
    KPLN = 0x4E4C504B,
    KPLT = 0x544C504B,
    KPEL = 0x4C45504B,
    KPES = 0x5345504B,
    KPEV = 0x5645504B,
};

type ParticleEmitterTracks = {
    emissionRate?: Float32Track;
    gravity?: Float32Track;
    longitude?: Float32Track;
    latitude?: Float32Track;
    lifespan?: Float32Track;
    speed?: Float32Track;
    visibility?: Float32Track;
};

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
};

function parseParticleEmitter(stream: BinaryStream): ParticleEmitter {
    const particleEmitter = {} as ParticleEmitter,
        nextOffset = stream.offset + stream.read("u32") - 4;

    // Read emitter fields
    particleEmitter.node = parseNode(stream);
    particleEmitter.emissionRate = stream.read("f32");
    particleEmitter.gravity = stream.read("f32");
    particleEmitter.longitude = stream.read("f32");
    particleEmitter.latitude = stream.read("f32");
    particleEmitter.spawnModelFileName = decode(stream.read("u8", 260));
    particleEmitter.lifespan = stream.read("f32");
    particleEmitter.initialVelocity = stream.read("f32");

    // Read emitter tracks
    particleEmitter.tracks = {};

    while (stream.offset < nextOffset) {
        const tag = stream.read("u32");

        if (tag === PARTICLE_EMITTER_TAGS.KPEE)
            particleEmitter.tracks.emissionRate = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_TAGS.KPEG)
            particleEmitter.tracks.gravity = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_TAGS.KPLN)
            particleEmitter.tracks.longitude = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_TAGS.KPLT)
            particleEmitter.tracks.latitude = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_TAGS.KPEL)
            particleEmitter.tracks.lifespan = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_TAGS.KPES)
            particleEmitter.tracks.speed = parseFloat32Track(stream);
        else if (tag === PARTICLE_EMITTER_TAGS.KPEV)
            particleEmitter.tracks.visibility = parseFloat32Track(stream);
        else
            throw new UnrecognizedChunkError(stream.offset - 4, "ParticleEmitter", tag, "KPEE, KPEG, KPLN, KPLT, KPEL, KPES, KPEV");
    }

    return particleEmitter;
}

export { parseParticleEmitter, type ParticleEmitter };
