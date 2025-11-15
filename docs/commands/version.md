# clavix version

## Description
Prints the installed Clavix version using metadata from `package.json`.

## Syntax
```
clavix version
```

## Arguments
- None.

## Flags
- None.

## Inputs
- `package.json` located in the project root (resolved through the compiled CLI).

## Outputs
- Console message in the form `Clavix vX.Y.Z`.

## Examples
- `clavix version`

## Common messages
- `✗ Could not determine version` – Clavix could not read the package metadata. Reinstall the CLI or check file permissions.
