import type { Options } from 'tsup';

export const tsup: Options = {
    entry: ["./src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
};