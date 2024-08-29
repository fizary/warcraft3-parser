Parser for Warcraft 3: Reforged file formats.

## Example usage

All parsers use BinaryStream from [fizary/hexcod](https://github.com/fizary/hexcod) package to read data.

```typescript
import { BinaryStream } from "hexcod";
import { parse } from "warcraft3-parser/mdx";

// Example MDX file
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

// Call a parse function and pass stream as it's first argument
const model = parse(stream);

// Access whatever data you need
console.log(`Model name: ${ model.metadata?.name }`);
console.log(`Blend time: ${ model.metadata?.blendTime }`);

// Output:
// Model name: Arthas
// Blend time: 150
```

## Prerequirements

This package heavily relies on [fizary/hexcod](https://github.com/fizary/hexcod) package that is not published and requires manual installation.
Please follow installation steps from that package first.

## Installation

This package is not published in any registry and requires manual installation.

```bash
# Clone repository
git clone https://github.com/fizary/warcraft3-parser.git
cd warcraft3-parser

# Install dependencies, this step requires fizary/hexcod package tarball to be present in root directory (please read prerequirements)
npm i

# Compile source code
npm run build

# Generate type declarations
npm run types:emit

# Create package tarball to be installed in your project
npm pack
```

Last step is to move created tarball into your projects root directory and install it.

```bash
npm i warcraft3-parser-0.0.0.tgz
```
