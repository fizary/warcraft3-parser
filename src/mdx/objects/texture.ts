import { BinaryStream, decode } from "hexcod";

const enum TextureWrap {
    None = 0,
    Width = 1,
    Height = 2,
    Both = 3,
}

type Texture = {
    replaceableId: number;
    fileName: string;
    wrap: number;
}

function parseTexture(stream: BinaryStream): Texture {
    const texture = {} as Texture;

    texture.replaceableId = stream.read("u32");
    texture.fileName = decode(stream.read("u8", 260));
    texture.wrap = stream.read("u32");

    return texture;
}

export { parseTexture, TextureWrap, type Texture };
