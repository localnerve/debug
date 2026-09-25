import { spawn } from "node:child_process"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: { index: "src/index.ts" },
  clean: true,
  dts: {
    compilerOptions: {
      ignoreDeprecations: "6.0",
    }
  },
  format: ["esm"],
  name: "debug",
  minify: true,
  fixedExtension: false,
  hooks: {
    "build:done": async () => {
      const process = spawn("npm", ["run", "size"], { shell: true })
      process.stdout.on("data", (data: any) => console.log(data.toString()))
    },
  },
})
