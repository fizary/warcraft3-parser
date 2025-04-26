import { decode } from "hexcod";

export class MissingMagicBytesError extends Error {
    override name = "MissingMagicBytesError";

    constructor(offset: number) {
        super(`[MDX] Parsing error at offset ${ offset }: missing magic bytes.`);
    }
}

export class MissingVersionChunkError extends Error {
    override name = "MissingVersionChunkError";

    constructor(offset: number) {
        super(`[MDX] Parsing error at offset ${ offset }: missing version chunk.`);
    }
}

export class InvalidVersionError extends Error {
    override name = "InvalidVersionError";

    constructor(offset: number, version: number, supportedVersions: string) {
        super(`[MDX] Parsing error at offset ${ offset }: version ${ version } is not supported. Supported versions: ${ supportedVersions }.`);
    }
}

export class MissingChunkError extends Error {
    override name = "MissingChunkError";

    constructor(offset: number, objectName: string, tag: string) {
        super(`[MDX] Parsing error at offset ${ offset }: missing required chunk "${ tag }" of ${ objectName } object.`);
    }
}

export class UnrecognizedChunkError extends Error {
    override name = "UnrecognizedChunkError";

    constructor(offset: number, objectName: string, tag: number, validTags: string) {
        super(`[MDX] Parsing error at offset ${ offset }: unrecognized chunk "${ decode(new Uint32Array([tag])) }" of ${ objectName } object. Valid chunks are: ${ validTags }.`);
    }
}

export class UnrecognizedValueError extends Error {
    override name = "UnrecognizedValueError";

    constructor(offset: number, objectName: string, propertyName: string, value: number, validValues: string) {
        super(`[MDX] Parsing error at offset ${ offset }: unrecognized value "${ value }" of ${ objectName } property ${ propertyName }. Valid values are: ${ validValues }.`);
    }
}
