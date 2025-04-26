Parsing utilities for Warcraft 3: Reforged file formats.

## 📦 Supported formats

🟢 [**`.MDX`**](./src/mdx/README.md) - Proprietary 3D model format.  
🔴 **`.DDS`** - Container format for storing compressed and uncompressed textures.

**Legend:**  
🟢 Fully supported 🟡 Partial/limited support 🔴 Not supported yet

## 🛠️ Installation

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
