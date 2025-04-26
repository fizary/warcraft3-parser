import { BinaryStream } from "hexcod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParseFn<T> = (stream: BinaryStream, ...args: any) => T;

export function parseArrayChunk<T, U extends ParseFn<T>>(parse: U, nextChunkOffset: number, ...args: Parameters<U>): T[] {
    const result = [] as T[];
    const [stream, ...rest] = args;
    
    while (stream.offset < nextChunkOffset)
        result.push(parse(stream, ...rest));

    return result;
}
