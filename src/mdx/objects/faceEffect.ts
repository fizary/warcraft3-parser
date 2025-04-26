import { BinaryStream, decode } from "hexcod";

type FaceEffect = {
    target: string;
    path: string;
};

function parseFaceEffect(stream: BinaryStream): FaceEffect {
    const faceEffect = {} as FaceEffect;

    // Read face effect fields
    faceEffect.target = decode(stream.read("u8", 80));
    faceEffect.path = decode(stream.read("u8", 260));

    return faceEffect;
}

export { parseFaceEffect, type FaceEffect };
