Documentation of the `warcraft3-parser/mdx` entrypoint. For installation see the [main README](../../README.md).

## Table of Contents

- [Overview](#overview)
- [Parsing a model](#parsing-a-model)
- [Advanced parsing utilities](#advanced-parsing-utilities)
- [Constants](#constants)

## Overview

This module provides parsing utilities for the proprietary MDX format, used in Warcraft III to store 3D models in a compact binary form.

The MDX format consists of a sequence of tagged binary chunks, each representing a specific part of the model (e.g. geometry, animations, materials). Most chunks are optional and may appear in different orders depending on the model. The format comes in versions 800, 900, 1000 and 1100, with this parser currently supporting up to version 1000 (used prior to the patch on August 17th, 2022).

## Parsing a model

The primary function in this module is `parse`, which reads an entire MDX model from a binary stream. It processes chunk headers, decodes all recognized chunk types, and assembles them into a structured model object. The returned object represents the complete contents of an MDX file. Most of its properties are optional and will only be present if the corresponding chunks are included in the source data.

```typescript
parse(stream: BinaryStream): Model;
```

### Example usage

```typescript
import { BinaryStream } from "hexcod";
import { parse } from "warcraft3-parser/mdx";

// Very simplified example of MDX file
const view = new Uint8Array([
    77, 68, 76, 88, 86, 69, 82, 83, 4, 0, 0, 0, 232, 3, 0, 0, 77, 79, 68, 76,
    116, 1, 0, 0, 65, 114, 116, 104, 97, 115, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 236, 17, 248, 194, 52, 177, 190, 194, 100, 204, 73, 193, 31, 101, 50,
    67, 106, 252, 205, 66, 72, 193, 135, 67, 150, 0, 0, 0
]);

// Create stream from above source
const stream = new BinaryStream(view);

// Call the parse function and pass the stream as its first argument
const model = parse(stream);

// Access the data
if (model.metadata) {
    console.log(`Model name: ${ model.metadata.name }`);
    console.log(`Blend time: ${ model.metadata.blendTime }`);
}

// Output:
// Model name: Arthas
// Blend time: 150
```

## Advanced parsing utilities

> 💡 Functions listed in this section parse a **single object** from a chunk's body - they do not handle entire chunks.

Most chunks in the MDX format contain arrays of objects. This entry point provides utility functions for parsing those objects individually.

```typescript
parseAttachment(stream: BinaryStream): Attachment;
parseBone(stream: BinaryStream): Bone;
parseCamera(stream: BinaryStream): Camera;
parseCollisionShape(stream: BinaryStream): CollisionShape;
parseCornEmitter(stream: BinaryStream): CornEmitter;
parseEvent(stream: BinaryStream): Event;
parseFaceEffect(stream: BinaryStream): FaceEffect;
parseGeoset(stream: BinaryStream, version: number): Geoset;
parseGeosetAnimation(stream: BinaryStream): GeosetAnimation;
parseLayer(stream: BinaryStream, version: number): Layer;
parseLight(stream: BinaryStream): Light;
parseMaterial(stream: BinaryStream, version: number): Material;
parseMetadata(stream: BinaryStream): Metadata;
parseNode(stream: BinaryStream): Node;
parseParticleEmitter(stream: BinaryStream): ParticleEmitter;
parseParticleEmitter2(stream: BinaryStream): ParticleEmitter2;
parseRibbonEmitter(stream: BinaryStream): RibbonEmitter;
parseSequence(stream: BinaryStream): Sequence;
parseTexture(stream: BinaryStream): Texture;
parseTextureAnimation(stream: BinaryStream): TextureAnimation;
```

### Example usage

```typescript
import { parseTexture, type Texture } from "warcraft3-parser/mdx";

// Assume you already have all required values: stream, textureChunkBodyOffset and textureChunkSize

// Move stream pointer to the start of the texture chunk
stream.seek(textureChunkBodyOffset);

// Calculate the end offset of this chunk
const nextChunkOffset = stream.offset + textureChunkSize;

// Parse all texture entries within this chunk
const textures: Texture[] = [];

while (stream.offset < nextChunkOffset)
    textures.push(parseTexture(stream));
```

## Constants

Some objects include flag fields that store multiple boolean values as bitmasks. This entry point exposes constants that can be used to test or combine those flags.

| Name | Values |
|-|-|
| **GEOSET_SELECTION_FLAGS** | None<br>Unselectable |
| **LAYER_SHADING_FLAGS** | Unshaded<br>SphereEnvironmentMap<br>TwoSided<br>Unfogged<br>NoDepthTest<br>NoDepthSet |
| **MATERIAL_RENDER_FLAGS** | None<br>ConstantColor<br>SortPrimitivesNearZ<br>SortPrimitivesFarZ<br>FullResolution |
| **NODE_FLAGS** | Helper<br>DontInheritTranslation<br>DontInheritRotation<br>DontInheritScaling<br>Billboarded<br>BillboardedLockX<br>BillboardedLockY<br>BillboardedLockZ<br>CameraAnchored<br>Bone<br>Light<br>EventObject<br>Attachment<br>ParticleEmitter<br>CollisionShape<br>RibbonEmitter<br>PEUsesMdlPE2Unshaded<br>PEUsesTgaPE2SortPrimitivesFarZ<br>LineEmitter<br>Unfogged<br>ModelSpace<br>XYQuad |
