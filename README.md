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

## Installation

This package is not published in any registry and requires manual installation.

### 1. Prerequirements

This package heavily relies on [fizary/hexcod](https://github.com/fizary/hexcod) package that is not published and requires manual installation.
Please follow first step of installation process from that package first.

Both hexcod and this package should be colocated in same parent directory (eg. projects/hexcod and projects/warcraft3-parser).

### 2. Clone and compile source

```bash
# Clone repository
git clone https://github.com/fizary/warcraft3-parser.git
cd warcraft3-parser

# READ PREREQUIREMENTS BEFORE INSTALLING DEPENDENCIES
# Install dependencies
npm i

# Compile source code
npm run build

# Generate type declarations
npm run types:emit
```

### 3. Installation from local source

There are couple ways to install dependencies from local source.

#### Install from directory (recommended)

```bash
# Use `file:` protocol with path to directory you want to install, eg.
npm i file:../warcraft3-parser
```

**Important!** Make sure directory you want to install is located outside of your project's root directory to avoid installing and hoisting it's dependencies to your project's node_modules.

#### Install from tarball

```bash
# Run this command in library's root directory to create tarball
npm pack

# You can move this tarball to any location, in this example we will move it to parent directory
mv warcraft3-parser-0.0.0.tgz ../warcraft3-parser-0.0.0.tgz

# Then we go to our project's root directory
cd ../my-project

# And finally install the dependency
npm i ../warcraft3-parser-0.0.0.tgz
```
