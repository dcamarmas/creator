# Version Management System

## Overview

CREATOR now uses a dynamic version management system that automatically handles version numbering based on the build channel (stable or nightly).

## How It Works

### Version Determination Priority

The version is determined using the following priority order:

1. **`CREATOR_VERSION` environment variable** (highest priority)
   - Allows manual override for testing or special builds
   - Example: `export CREATOR_VERSION=6.1.0-rc1`

2. **`CREATOR_CHANNEL` environment variable**
   - `CREATOR_CHANNEL=nightly`: Generates `nightly-YYYYMMDD` format
   - `CREATOR_CHANNEL=stable`: Uses version from package.json
   - Example: `export CREATOR_CHANNEL=nightly`

3. **Automatic inference from package.json**
   - If version contains prerelease identifiers (`beta`, `alpha`, `rc`, `nightly`), treats as nightly
   - Otherwise treats as stable
   - Current package.json version: `6.0.0-beta` → automatically treated as nightly

## Version Formats

### Stable Channel
- Format: `major.minor.patch` (e.g., `6.0.0`, `6.1.0`)
- Source: `package.json` version field
- Used for: Official releases with version tags

### Nightly Channel
- Format: `nightly-YYYYMMDD` (e.g., `nightly-20251217`)
- Source: Auto-generated from current UTC date at build time
- Used for: Continuous integration builds from master branch

## CI/CD Integration

### GitHub Actions Configuration

The workflow has been updated to set the `CREATOR_CHANNEL` environment variable:

```yaml
- name: Build cli binaries
  env:
    CREATOR_CHANNEL: nightly  # Set to 'stable' for release builds
  run: |
    bun run-p build:cli:windows build:cli:mac-x64 ...
```

### For Stable Releases

When creating a tagged release, remove or set `CREATOR_CHANNEL=stable` to use the package.json version:

```yaml
- name: Build cli binaries
  env:
    CREATOR_CHANNEL: stable
  run: |
    bun run-p build:cli:windows build:cli:mac-x64 ...
```

Or simply don't set the variable if your package.json has a proper semantic version without prerelease identifiers.

## Local Development

### Testing Nightly Builds Locally

```bash
# Set nightly channel
export CREATOR_CHANNEL=nightly

# Build the CLI
bun run build:cli:native

# The binary will report version as nightly-YYYYMMDD
./creator-cli
```

### Testing Stable Builds Locally

```bash
# Set stable channel
export CREATOR_CHANNEL=stable

# Build the CLI
bun run build:cli:native

# The binary will report version from package.json
./creator-cli
```

### Override Version for Testing

```bash
# Directly set a specific version
export CREATOR_VERSION=6.0.0-test1

# Build the CLI
bun run build:cli:native

# The binary will report version as 6.0.0-test1
./creator-cli
```

## Update Checker Behavior

The update checker automatically determines the appropriate channel:

1. If current version matches `nightly-YYYYMMDD` pattern → checks nightly channel
2. If current version contains prerelease identifiers → checks nightly channel
3. Otherwise → checks stable channel

### Nightly Updates
- Checks: `https://api.github.com/repos/creatorsim/creator-beta/releases/tags/nightly`
- Compares by date (YYYYMMDD)
- Shows update notification if a newer nightly build exists

### Stable Updates
- Checks: `https://api.github.com/repos/creatorsim/creator/releases/latest`
- Compares by semantic version (major.minor.patch)
- Shows update notification if a newer stable version exists

## Code Structure

### Main Files

- **`src/cli/version.mts`**: Version determination logic
  - `getVersion()`: Returns the current version
  - `isNightlyBuild()`: Determines if on nightly channel
  - `generateNightlyVersion()`: Generates nightly version string

- **`src/cli/update-checker.mts`**: Update checking logic
  - Detects channel from current version
  - Fetches latest version from appropriate GitHub repo
  - Compares versions and displays notifications

- **`src/cli/creator-cli.mts`**: CLI entry point
  - Calls `getVersion()` to get current version
  - Passes version to update checker

- **`src/cli/commands/info.mts`**: Info/about command
  - Displays current version from `getVersion()`

## Migration from Hardcoded Version

### Before
```typescript
// version was hardcoded in package.json as "6.0.0-beta"
checkForUpdates(packageJson.version);
```

### After
```typescript
// version is determined dynamically
import { getVersion } from "./version.mts";
const currentVersion = getVersion();
checkForUpdates(currentVersion);
```

## Recommendations

### For Nightly Builds
1. Keep `CREATOR_CHANNEL=nightly` in your nightly workflow
2. The version will automatically be `nightly-YYYYMMDD`
3. Users will see update notifications daily if they run nightly builds

### For Stable Releases
1. Update `package.json` version to proper semantic version (e.g., `6.0.0`, `6.1.0`)
2. Remove prerelease identifiers from package.json version
3. Set `CREATOR_CHANNEL=stable` or leave unset
4. Create a git tag matching the version
5. Trigger the release workflow

### Version Bumping Strategy
```json
// For stable releases - update package.json:
{
  "version": "6.0.0"  // No prerelease identifier
}

// For development/beta - keep prerelease:
{
  "version": "6.1.0-beta"  // Automatically treated as nightly
}
```

## Testing the Implementation

```bash
# 1. Test version detection
deno run -A ./src/cli/creator-cli.mts --help

# 2. Test with different channels
CREATOR_CHANNEL=stable deno run -A ./src/cli/creator-cli.mts --help
CREATOR_CHANNEL=nightly deno run -A ./src/cli/creator-cli.mts --help

# 3. Test version override
CREATOR_VERSION=test-1.0.0 deno run -A ./src/cli/creator-cli.mts --help

# 4. Check update checker behavior
deno run -A ./src/cli/creator-cli.mts -a ./architecture/RISCV/RV32IMFD.yml -s ./tests/arch/riscv/correct/examples/test_riscv_example_001.s
```

## Benefits

1. **Automatic nightly versioning**: No manual version updates needed for nightly builds
2. **Clear channel separation**: Users know if they're on stable or nightly
3. **Proper update notifications**: Users on nightly see nightly updates, stable users see stable updates
4. **Flexible override**: Can test with specific versions using environment variables
5. **CI/CD ready**: Simple environment variable configuration in workflows
