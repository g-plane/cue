import { emptyDir } from "https://deno.land/std@0.172.0/fs/mod.ts";
import { build } from "https://deno.land/x/dnt@0.33.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {},
  package: {
    name: "@gplane/cue",
    version: "0.0.0",
    description: "Cue Sheet manipulation library.",
    author: "Pig Fang <g-plane@hotmail.com>",
    license: "MIT",
    keywords: ["cue", "cuesheet", "metadata", "audio", "music"],
    sideEffects: false,
    publishConfig: {
      access: "public",
    },
  },
  packageManager: "pnpm",
  test: false,
  typeCheck: false,
  skipSourceOutput: true,
});
