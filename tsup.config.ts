import { spawn } from "node:child_process"
import { defineConfig } from "tsup"

export default defineConfig({
  entry: { index: "src/index.ts" },
  splitting: false,
  clean: true,
  dts: {
    compilerOptions: {
      ignoreDeprecations: "6.0",
    }
  },
  target: "es2020",
  format: ["esm"],
  name: "debug",
  minify: "terser",
  terserOptions: {
    compress: true,
  },
  async onSuccess() {
    const process = spawn("npm", ["run", "size"], { shell: true })
    process.stdout.on("data", (data: any) => console.log(data.toString()))
  },
})
